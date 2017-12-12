const axios = require('axios');
const Request = require('./Request');
const Record = require('./Record');
const { LinkToAnotherRecord, Lookup, Rollup, UnknownField } = require('./fields');

class Table {
  constructor(airtable, base, name, fields = {}) {
    this._airtable = airtable;
    this._defaultFields = {};
    this.base = base;
    this.fields = fields;
    this.name = name;
  }

  get _airtable() {
    return this._airtable_;
  }

  get _defaultFields() {
    return this._defaultFields_;
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
      throw new Error('TableError: _airtable can not be changed!');
    this._airtable_ = airtable;
  }

  set _defaultFields(defaultFields) {
    if (this._defaultFields !== undefined)
      throw new Error('TableError: _defaultFields can not be changed!');
    this._defaultFields_ = defaultFields;
  }

  set base(base) {
    if (this._base !== undefined)
      throw new Error('TableError: base can not be changed!');
    this._base = base;
  }

  set fields(fields) {
    if (this.fields !== undefined)
      throw new Error('TableError: fields can not be changed!');
    if (typeof fields !== 'object' || Array.isArray(fields))
      throw new Error('Fields must be a key-value Object: Received a(n) ' + Array.isArray(fields) ? 'array' : typeof fields + '.');
    Object.entries(fields).forEach(([key, value]) => {
      value.name = value.name || key;
      fields[key] = value;
      this._defaultFields[key] = new value.type(value.name, undefined, value);
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
    if (this.fields === undefined)
      return [];
    const entries = Object.entries(this._defaultFields);
    for (let i = 0; i < entries.length; i++)
      if (entries[i][1].name === name)
        return entries[i];
    return [];
  }

  createField(name, value=null) {
    if (Object.keys(this.fields).indexOf(name) >= 0)
      throw new Error(`TableError: Field '${name}' already exists!`);
  }

  createRecord(record) {

  }

  query(parameters = {}, setUpLinks = true) {
    return new Promise((resolve, reject) => {
      const { fields, filterByFormula, maxRecords, pageSize = 100, sort, view = 'Grid view' } = parameters;
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
            view
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
              }
            };
            const records = [];
            res.data.records.forEach((record) => {
              const fields = {...this._defaultFields};
              Object.entries(record.fields).forEach(([name, value]) => {
                const [key, settings] = this._getFieldEntry(name);
                const args = [name, value, settings];
                const f = settings === undefined ? new UnknownField(...args) : new settings.type(...args);
                fields[key || name] = f;
              })
              try {
                records.push(new Record(this, record.id, record.createdTime, fields));
              } catch (error) {
                reject(error);
              }
            });
            // set up link Fields
            let remainingPromises = 0;
            //wait for promises to finish
            const waitForPromises = () =>
              new Promise((resolve) => {
                const checkPromises = () => {
                  if (remainingPromises > 0)
                    setTimeout(checkPromises, 250);
                  else
                    resolve();
                }
                checkPromises();
              }).catch(reject);
            const retrieved = {};
            const storeRecord = (record) => {
              if (typeof retrieved[record.table.name] !== 'object')
                retrieved[record.table.name] = {};
              if (!(retrieved[record.table.name][record.id] instanceof Record))
                retrieved[record.table.name][record.id] = record;
            }
            if (setUpLinks)
              records.forEach(storeRecord);
            const getLinkedRecords = () => {
              let recheck = false;
              // find records to get and fill in linked records
              const searchedRecords = {};
              const searchForLinks = (record) => {
                if (searchedRecords[record.table.name + record.id])
                  return;
                else
                  searchedRecords[record.table.name + record.id] = true;
                const links = Object.values(record.fields).reduce((links, next) => {
                  if (next instanceof LinkToAnotherRecord)
                    links.push(next);
                  return links;
                }, []);
                links.forEach((link) => {
                  const values = link.isMulti ? link.value : [link.value];
                  values.forEach((id, index) => {
                    if (id instanceof Record) {
                      console.log('id was record... ', id.id, id.table.name, id.constructor.name)
                      searchForLinks(id);
                    } else {
                      if (typeof retrieved[link.options.table] !== 'object')
                        retrieved[link.options.table] = {};
                      const linked = retrieved[link.options.table][id];
                      recheck = true;
                      if (linked instanceof Record) {
                        console.log(`added ${linked.table.name} (${linked.id}) record to ${record.table.name} (${record.id})`);
                        if (link.isMulti)
                          link.value[index] = linked;
                        else
                          link.value = linked;
                      } else {
                        retrieved[link.options.table][id] = true;
                      }
                    }
                  });
                });
              };
              records.forEach(searchForLinks);
              // get missing linked records
              Object.entries(retrieved).forEach(([tableName, keys]) => {
                let ids = Object.keys(keys);
                ids = ids.reduce((arr, id) => {
                  if (!(retrieved[tableName][id] instanceof Record))
                    arr.push(id);
                  return arr;
                }, []);
                if (ids.length === 0)
                  return;
                const table = this._airtable.getTable(tableName, this.base);
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
              });
              waitForPromises().then(() => {
                if (recheck)
                  getLinkedRecords()
                else {
                  console.log('resolve after wait')
                  resolve(records)
                }
              })
            };
            if (setUpLinks)
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

  _maskKey() {

  }
}

module.exports = Table;
