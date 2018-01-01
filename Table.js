const axios = require('axios');
const Request = require('./Request');
const Record = require('./Record');
const RecordArray = require('./RecordArray');
const { LinkToAnotherRecord, Lookup, Rollup, UnknownField, Field } = require('./fields');

class Table {
  constructor(airtable, base, name, fields = {}) {
    this._airtable = airtable;
    this._defaultFields = {};
    this.base = base;
    this.name = name;
    this.fields = fields;
  }

  get _airtable() {
    return this._airtable_;
  }

  get _defaultFields() {
    if (this._defaultFields_ === undefined)
      return undefined;
    return Object.entries(this._defaultFields_).reduce((defaults, [key, field]) => {
      defaults[key] = field instanceof Field ? field.copy() : field;
      if (defaults[key] instanceof LinkToAnotherRecord)
        this.__addAddRecordFunction__(defaults[key]);
      return defaults;
    }, {});
  }

  get base() {
    return this._base;
  }

  get fields() {
    return this._fields;
  }

  get name() {
    return this._name;
  }

  set _airtable(airtable) {
    if (this._airtable !== undefined)
      throw new Error('TableError: _airtable cannot be changed!');
    this._airtable_ = airtable;
  }

  set _defaultFields(defaultFields) {
    if (this._defaultFields !== undefined)
      throw new Error('TableError: _defaultFields cannot be changed!');
    this._defaultFields_ = defaultFields;
  }

  set base(base) {
    if (this._base !== undefined)
      throw new Error('TableError: base cannot be changed!');
    this._base = base;
  }

  set fields(fields) {
    if (this.fields !== undefined)
      throw new Error('TableError: fields cannot be changed!');
    if (typeof fields !== 'object' || Array.isArray(fields))
      throw new Error('Fields must be a key-value Object: Received a(n) ' + Array.isArray(fields) ? 'array' : typeof fields + '.');
    Object.entries(fields).forEach(([key, value]) => {
      if (typeof value !== 'object')
        return delete fields[key];
      const { name = key } = value;
      // if name doesn't exist then assume the name of the field is the key.
      // add the name of the table and the base it is in to the field config.
      // useful for debugging as they will be shown when errors are thrown within the field.
      fields[key] = { name, ...value, __table__: this.name, __base__: this.base };
      this._defaultFields_[key] = new value.type(value.name, undefined, value);
    });
    this._fields = fields;
  }

  set name(name) {
    if (this.name !== undefined)
      throw new Error('TableError: name can not be changed!');
    if (this._checkName(name))
      this._name = name;
  }

  _checkName(name) {
    if (typeof name !== 'string' || name.length < 1)
      throw new Error('TableError: name must be a string with a minimum length of 1 character.');
    return true;
  }

  _getFieldEntry(name) {
    if (this.fields === undefined)
      return [];
    const entries = Object.entries(this.fields);
    for (let i = 0; i < entries.length; i++)
      if (entries[i][1].name === name)
        return entries[i];
    return [];
  }

  _getDefaultFieldEntry(name) {
    if (this._defaultFields === undefined)
      return [];
    const entries = Object.entries(this._defaultFields);
    for (let i = 0; i < entries.length; i++)
      if (entries[i][1].name === name)
        return entries[i];
    return [];
  }

  createRecord(record) {

  }

  query(parameters = {}, setupLinks = true) {
    setupLinks = setupLinks === true;
    return new Promise((resolve, reject) => {
      const { fields, filterByFormula, maxRecords, pageSize = 100, sort, view = 'Grid view', offset } = parameters;
      const request = new Request(
        Request.types.get,
        {
          base: this.base,
          tableName: this.name,
          parameters: {
            fields,
            filterByFormula,
            maxRecords,
            pageSize,
            sort,
            view,
            offset
          },
        },
        (res) => {
          try {
            // surrounding everything in a try-catch so Promise doesn't get mad.
            const tryCB = (cb) => {
              return (...args) => {
                try {
                  cb(...args);
                } catch(error) {
                  reject(error);
                }
              };
            };
            if (res.data.records === undefined)
              resolve([]);
            const records = new RecordArray(this, res.data.offset, parameters, setupLinks);
            res.data.records.forEach(tryCB((record) => {
              const fields = {...this._defaultFields};
              Object.entries(record.fields).forEach(tryCB(([name, value]) => {
                const [key, settings] = this._getFieldEntry(name);
                const args = [name, value, { ...settings, __record__: record.id }];
                const f = settings === undefined ? new UnknownField(...args) : new settings.type(...args);
                if (f instanceof LinkToAnotherRecord)
                  this.__addAddRecordFunction__(f);
                fields[key || name] = f;
              }));
              try {
                records.push(new Record(this, record.id, record.createdTime, fields));
              } catch (error) {
                reject(error);
              }
            }));
            // set up link Fields
            let remainingPromises = 0;
            //wait for promises to finish
            const waitForPromises = () =>
              new Promise((resolve) => {
                try {
                  const checkPromises = () => {
                    if (remainingPromises > 0)
                      setTimeout(checkPromises, 250);
                    else
                      resolve();
                  }
                  checkPromises();
                } catch (error) {
                  reject(error);
                }
              });
            const retrieved = {};
            const storeRecord = (record) => {
              try {
                if (typeof retrieved[record.table.name] !== 'object')
                  retrieved[record.table.name] = {};
                if (!(retrieved[record.table.name][record.id] instanceof Record))
                  retrieved[record.table.name][record.id] = record;
              } catch (error) {
                reject(error);
              }
            }
            if (setupLinks)
              records.forEach(storeRecord);
            const getLinkedRecords = () => {
              try {
                let recheck = false;
                // find records to get and fill in linked records
                const searchedRecords = {};
                const searchForLinks = (record) => {
                  try {
                    if (searchedRecords[record.table.name + record.id])
                      return;
                    else
                      searchedRecords[record.table.name + record.id] = true;
                    const links = Object.values(record.fields).reduce((links, next) => {
                      if (next instanceof LinkToAnotherRecord)
                        links.push(next);
                      return links;
                    }, []);
                    links.forEach(tryCB((link) => {
                      const values = link.isMulti ? [...link.value] : [link.value];
                      values.forEach((id, index) => {
                        if (id instanceof Record) {
                          searchForLinks(id);
                        } else {
                          if (typeof retrieved[link.config.table] !== 'object')
                            retrieved[link.config.table] = {};
                          const linked = retrieved[link.config.table][id];
                          recheck = true;
                          if (linked instanceof Record) {
                            if (link.isMulti)
                              values[index] = linked;
                            else
                              link.value = linked;
                          } else {
                            retrieved[link.config.table][id] = true;
                          }
                        }
                      });
                      if (link.isMulti)
                        link.value = values;
                    }));
                  } catch (error) {
                    reject(error);
                  }
                };
                records.forEach(searchForLinks);
                // get missing linked records
                Object.entries(retrieved).forEach(tryCB(([tableName, keys]) => {
                  let ids = Object.keys(keys);
                  ids = ids.reduce((arr, id) => {
                    if (!(retrieved[tableName][id] instanceof Record))
                      arr.push(id);
                    return arr;
                  }, []);
                  const sendRequest = (ids) => {
                    if (ids.length === 0)
                      return;
                    const table = this._airtable.getTable(tableName, this.base);
                    if (table === undefined) {
                      console.log(new Error(`TableError: Table '${tableName}' is undefined. You may have an error in your Table definition. This Table is refered to by a LinkToAnotherRecord Field.`));
                      process.exit(1); //exit to prevent loop as it keeps trying to access this table
                    }
                    let filter = '';
                    if (ids.length >  1) {
                      filter = 'OR(';
                      ids.forEach(id => filter += `RECORD_ID() = "${id}", `);
                      filter = filter.substring(0, filter.length - 2) + ')';
                    } else {
                      filter = `RECORD_ID() = "${ids[0]}"`;
                    }
                    remainingPromises++;
                    table.query({ filterByFormula: filter }, false)
                      .then((records) => {
                        records.forEach(storeRecord);
                        remainingPromises--;
                      })
                      .catch((...args) => {
                        remainingPromises--;
                        reject(...args);
                      });
                  }
                  do {
                    sendRequest(ids.splice(0, ids.length > 100 ? 100 : ids.length));
                  } while(ids.length > 0);
                }));
                waitForPromises().then(() => {
                  if (recheck) {
                    getLinkedRecords()
                  } else {
                    resolve(records)
                  }
                })
              } catch (error) {
                reject(error);
              }
            };
            if (setupLinks)
              getLinkedRecords();
            else
              resolve(records);
          } catch (error) {
            reject(error);
          }
        },
        reject
      );
      this._airtable.sendRequest(request);
    });
  }

  _generateOrFilter(strings) {
    if (typeof strings === 'string')
      strings = [strings];
    if (!Array.isArray() || strings.length == 0)
      return;
    let filter = 'OR(';
    strings.forEach(string => filter += `RECORD_ID() = "${string}", `);
    filter = filter.substring(0, filter.length - 2) + ')';
    return filter;
  }

  __addAddRecordFunction__(linkToAnotherRecord) {
    if (!(linkToAnotherRecord instanceof LinkToAnotherRecord))
      throw new Error(`TableError: __addAddRecordFunction__ expects a LinkToAnotherRecord Object. Received: ${linkToAnotherRecord} of type ${typeof linkToAnotherRecord}`);
    const instance = this;
    const addRecord = function (record = null, setupLinks = true) {
      // in this function I return resolve(this) after using this._error because it should only hit the return
      // statmenet if __ignoreFieldErrors__ is set to true. It returns to ignore the attempted change
      const records = [];
      return new Promise((resolve, reject) => {
        try {
          if (record === null)
            return resolve(this);
          const value = this.value;
          if (this.config.__strict__ === true && !this.isMulti && value !== null) {
            this._error('There is already a record stored in this field.');
            return resolve(this);
          }
          const getID = (record) => {
            if (typeof record === 'string')
              return record;
            if (record instanceof Record)
              return record.id;
            this._error('Expected record to be a String or a Record Object.', record);
          };
          const requestRecord = (recordID) => {
            // this should never happen because it would be the API's fault.
            if (typeof recordID !== 'string') {
              this._error('Expected recordID to be a String.', recordID);
              return resolve(this);
            }
            const table = instance._airtable.getTable(this.config.table, instance.base);
            if (table === undefined) {
              console.log(new Error(`TableError: Table '${tableName}' is undefined. You may have an error in your Table definition. This Table is refered to by a LinkToAnotherRecord Field.`));
              process.exit(1); //exit to prevent loop as it keeps trying to access this table
            }
            table.query({ filterByFormula: `RECORD_ID() = "${recordID}"`}, setupLinks).then((query) => {
              try {
                const record = query[0];
                if (record === undefined) {
                  this._error('Unable to find Record with the given ID.', recordID);
                  return resolve(this);
                }
                if (this.isMulti) {
                  records.push(record);
                  this.value = records;
                } else {
                  this.value = record;
                }
                return resolve(this);
              } catch (error) {
                reject(error);
              }
            }).catch(reject);
          }
          const rID = getID(record);
          if (rID === undefined)
            return resolve(this);
          if (this.isMulti) {
            // add values other than the item being added. In the case that the item is already stored
            // and the stored version is a Record Object, it will just exit out and not request anything.
            for (let i = 0; i < value.length; i++) {
              const srID = getID(value[i]);
              if (srID === undefined)
                return resolve(this);
              if (rID !== srID)
                records.push(value[i]);
              else if (value[i] instanceof Record)
                return resolve(this); // already an instanceof Record so no point in re-requesting it.
            }
          } else {
            const srID = getID(value);
            if (rID === srID)
              return resolve(this);
          }
          requestRecord(rID);
        } catch (error) {
          reject(error);
        }
      });
    };
    Object.defineProperty(linkToAnotherRecord, 'addRecord', {
      value: addRecord,
      writable: false,
      configurable: false
    });
  }
}

module.exports = Table;
