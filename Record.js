const Field = require('./fields/Field');
const DateField = require('./fields/DateField');
const CreatedTime = require('./fields/CreatedTime');
const Currency = require('./fields/Currency');
const Percent = require('./fields/Percent');
const LinkToAnotherRecord = require('./fields/LinkToAnotherRecord');
const UnknownField = require('./fields/UnknownField');
const Request = require('./Request');

class Record {
  static get printRecordChanges() {
    return this._printRecordChanges;
  }

  static set printRecordChanges(value) {
    this._printRecordChanges = value;
  }

  constructor(table, id, createdTime, fields = {}) {
    this.createdTime = new CreatedTime('createdTime', createdTime, {
      dateFormat: 'ISO',
      includeTime: true,
      timeFormat: 24,
      includeSeconds: true
    });
    this.id = id;
    this._cache_ = [];
    this.fields = fields;
    this.table = table;
  }

  /* _knownFields
   * Do not use this!
   */
  get _knownFields() {
    return this._knownFields_ || {};
  }

  get createdTime() {
    return this._createdTime;
  }

  get fields() {
    return this._fields;
  }

  get id() {
    return this._id;
  }

  get primaryField() {
    return this.getPrimaryField().value;
  }

  get table() {
    return this._table;
  }

  /* _knownFields
   *  Do not use this!
   */
  set _knownFields(fields) {
    const knownFields = {};
    Object.entries(fields).forEach(([key, value]) => {
      knownFields[key] = true;
    })
    this._knownFields_ = knownFields;
  }

  set createdTime(createdTime) {
    if (this.createdTime !== undefined)
      throw new Error('RecordError: createdTime cannot be changed!');
    this._createdTime = createdTime;
  }

  set fields(fields) {
    if (fields === undefined)
      return;
    Object.entries(fields).forEach(([key, field]) => {
      if (!(field instanceof Field))
        throw new Error(`RecordError: A field '${key}' was not an instance of a Field object. Received: '${JSON.stringify(field, null, 2)}'`);
    });
    if (this._cache_ !== undefined)
      this._cache_.forEach((key) => {
        Object.defineProperty(this, key, {
          get: undefined,
          set: undefined,
          enumerable: true,
          configurable: true
        });
      });
    this._cache_ = Object.keys(fields);
    this._cache_.forEach((key) => {
      if (Record._checkField(key))
        Object.defineProperty(this, key, {
          get: () => this.fields[key].value,
          set: (value) => this.fields[key].value = value,
          enumerable: true,
          configurable: true
        });
    });
    this._fields = fields;
    this._knownFields = fields;
  }

  set id(id) {
    if (this.id !== undefined)
      throw new Error('RecordError: id cannot be changed!');
    this._id = id;
  }

  set primaryField(value) {
    this.getPrimaryField().value = value;
  }

  set table(table) {
    if (this.table !== undefined)
      throw new Error('RecordError: table cannot be changed!');
    if (typeof table !== 'object' || table._airtable_ === undefined)
      throw new Error("RecordError: Hmm... It doesn't look like you passed in a Table Object.");
    this._table = table;
  }

  getFieldByKey(key) {
    if (this.fields === undefined)
      return;
    return this.fields[key];
  }

  getFieldByName(name) {
    if (this.fields === undefined)
      return;
    const values = Object.values(this.fields);
    for (let i = 0; i < values.length; i++) {
      const field = values[i];
      if (field.name === name)
        return field;
    }
  }

  getPrimaryField() {
    const entries = Object.entries(this.fields);
    for (let i = 0; i < entries.length; i++) {
      const [key, field] = entries[i];
      if (field.isPrimary())
        return field;
    }
    throw new Error(`RecordError: No primary field set for Table '${this.table.name}'`);
  }

  fget(name) {
    return this.getFieldByName(name);
  }

  fgetk(key) {
    return this.getFieldByKey(key);
  }

  get(name) {
    const field = this.getFieldByName(name);
    if (field === undefined)
      return;
    return field.value;
  }

  getk(key) {
    const field = this.getFieldByKey(key);
    if (field === undefined)
      return;
    return field.value;
  }

  has(name) {
    return this.getFieldByName(name) !== undefined;
  }

  hask(key) {
    return this.getFieldByKey(key) !== undefined;
  }

  put(name, value) {
    const field = this.getFieldByName(name);
    if (field === undefined)
      throw new Error(`TableError: Field '${name}' does not exist!`);
    field.value = value;
  }

  putk(key, value) {
    const field = this.getFieldByKey(key);
    if (field === undefined)
      throw new Error(`TableError: Field '${key}' does not exist!`);
    field.value = value;
  }

  create(setupLinks = true) {
    setupLinks = setupLinks === true;
    return this.table.createRecord(this, setupLinks);
  }

  save(deepSave = true) {
    return this.update(deepSave);
  }

  update(deepUpdate = true) {
    return new Promise((resolve, reject) => {
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
      resolve = tryCB(resolve);
      reject = tryCB(reject);

      try {
        const changed = [];

        Object.entries(this.fields).forEach(([key, field]) => {

          if (!(field instanceof Field)) {
            //this will get triggered if someone does <record>.fields.<key> = <value> rather than <record>.fields.<key>.value = <value>
            if (this.table.fields[key] !== undefined) {
              console.error(new Error(
                `RecordError: The field '${key}' in table '${this.table.name}' was improperly set. ` +
                'Attempting to fix the error....'
              ).toString());
              this.fields[key] = this.table._blankFields[key];
              this.fields[key].config.__record__ = this;
              this.fields[key].value = field;
              if (this.fields[key].value === undefined)
                this.fields[key]._originalValue = null; // they were likely trying to clear the field so this will make sure it clears
              field = this.fields[key];
            }
          }

          if (this._knownFields[key] !== true) {
            console.error(new Error(
              `RecordError: A field '${key}' was attempted to be saved to a record in table '${this.table.name}'. ` +
              `This field did not exist until the save operation. ` +
              `New fields must be created on the Airtable website as there is no support for this through their API. ` +
              `Deleting '${key}' from the record and continuing operation...`
            ).toString());
            delete this.fields[key];
            return;
          } else if (field._changed) {
            changed.push(key);
          }

        });

        if (changed.length > 0 && Record._printRecordChanges) {
          console.log('Changed fields:');
          console.log(JSON.stringify(changed.map((key) => {
            return {
              key: key,
              originalValue: this.fields[key]._originalValue,
              newValue: this.fields[key]._saveValue
            };
          }), null, 2));
        }

        let remainingPromises = 0;
        const saveError = (reject, error, ...args) => {

          remainingPromises--;
          if (typeof error.response !== 'undefined') {
            if (error.response.status === 429) {
              // it'll just return because a 429 error references the API Request Limit being exceeded.
              // the then/success and catch/fail methods will still work because the request is scheduled to re-run automatically
              // after a cooldown.
              return;
            }
          }

          Object.entries(this.fields).forEach(([key, field]) => {
            // skip over LinkToAnotherRecords because their save handlers will also do this,
            // provided deepUpdate was set to true. Their save handlers are on seperate requests
            // so failing here shouldn't effect them.
            if (!(field instanceof LinkToAnotherRecord) && field.value !== field._originalValue)
              field.value = field._originalValue; // reset fields on an error
          });
          reject(error, ...args);

        };

        if (deepUpdate === true) {
          const cache = { [this.id]: true };
          const searchFields = (record) => {
            Object.entries(this.fields).forEach(([key, field]) => {
              if (field instanceof LinkToAnotherRecord) {
                const records = field.isMulti ? field.value : [field.value];
                records.forEach((record) => {
                  if (!(record instanceof Record))
                    return;
                  if (cache[record.id] !== true) {
                    cache[record.id] = true;
                    remainingPromises++;
                    record.save(false)
                      .then(() => remainingPromises--)
                      .catch((...args) => saveError(reject, ...args));
                  }
                });
              }
            });
          };
          searchFields(this);
        }

        const waitForPromises = (resolve) => {
          if (remainingPromises > 0)
            setTimeout(() => waitForPromises(resolve), 250);
          else
            resolve(this);
        };

        // this will trigger if they saved but didn't make any changes. If they didn't do .save(false)
        // then it will wait for any linked records to save before resolving.
        if (changed.length === 0)
          return waitForPromises(resolve);

        this.table._airtable.sendRequest(new Request(
          Request.types.patch,
          {
            base: this.table.base,
            tableName: this.table.name,
            appendID: this.id,
            data: {
              fields: changed.reduce((obj, item) => {
                obj[this.fields[item].name] = this.fields[item]._saveValue;
                return obj;
              }, {})
            }
          },
          (res) => {
            Object.entries(this.fields).forEach(([key, field]) => {
              field._originalValue = field._saveValue;
              this._fields = this.fields;
            });
            waitForPromises(resolve);
          },
          (...args) => saveError(reject, ...args)
        ));
      } catch (error) {
        reject(error);
      }
    });
  }

  dangerouslyReplace() {

  }

  dangerouslyDelete() {

  }

  _copyFields(fields) {
    const fieldsCopy = {};
    Object.entries(fields).forEach(([key, field]) => {
      fieldsCopy[key] = field.copy();
    });
    return fieldsCopy;
  }

  stringify(replacer, space) {
    // I don't want to toString() every value
    // because I don't want to return numbers as strings.
    // shouldToString is used to indentify fields that should be
    // printed a certain way such as Currency with the specified
    // symbol or Dates using the specified formatting.
    const shouldToString = (field) => {
      if (field instanceof Field) {
        switch (field.constructor) {
          case CreatedTime:
          case DateField:
          case Currency:
          case Percent:
            return true;
          default:
            return false;
        }
      }
      return false;
    };
    return `${this.table.name} Record ` + JSON.stringify({
      id: this.id,
      fields: {
        ...Object.entries(this.fields).reduce((fields, [key, field]) => {
          let value = field.value;
          if (value instanceof Record)
            value = `Record [${value.table.name} : ${value.id}]`;
          if (shouldToString(field))
            value = field.toString(false);
          if (Array.isArray(value))
            value = value.map((value) => {
              if (value instanceof Record)
                return `Record [${value.table.name} : ${value.id} : ${shouldToString(value.getPrimaryField()) ? value.getPrimaryField().toString(false) : value.primaryField}]`;
              else
                return value;
            });
            fields[key] = value === undefined ? null : value
          return fields;
        }, {})
      },
      createdTime: this.createdTime.toString(false)
    }, replacer, space);
  }

  static _checkField(key) {
    if (Record._blacklist_.indexOf(key) >= 0) {
      throw new Error(`FieldError: Oops! Looks like you managed to pick the same name as an Object that's being used in the Record class. Please pick a name other than '${key}'.`)
    }
    return true;
  }

  static _configureBlacklist() {
    Record._blacklistVariables_ = [
      '_cache_',
      '__fields__',
      '_fields',
      '_table'
    ];
    Record._blacklistVariablesNoWrite_ = [
      '_blacklist_',
      '_blacklistVariables_',
      '_blacklistVariablesNoWrite_',
      '_blacklistGettersSetters_',
      '_blacklistFunctions_',
      '_createdTime',
      '_id',
    ];
    Record._blacklistGettersSetters_ = [
      '_fields_',
      '_printRecordChanges',
      'createdTime',
      'fields',
      'id',
      'primaryField',
      'table'
    ];
    Record._blacklistFunctions_ = [
      'getFieldByName',
      'getFieldByKey',
      'getPrimaryField',
      'has',
      'fget',
      'fgetk',
      'get',
      'put',
      'hask',
      'getk',
      'putk',
      'save',
      'update',
      'dangerouslyReplace',
      '_copyFields'
    ];

    Record._blacklist_ = []
      .concat(Record._blacklistVariables_)
      .concat(Record._blacklistVariablesNoWrite_)
      .concat(Record._blacklistGettersSetters_)
      .concat(Record._blacklistFunctions_);

    Record._blacklistVariables_.forEach((key) => {
      Object.defineProperty(Record, key, {
        value: Record[key],
        enumerable: false,
        configureable: false,
        writable: true
      });
    });

    Record._blacklistVariablesNoWrite_.forEach((key) => {
      Object.defineProperty(Record, key, {
        value: Record[key],
        enumerable: false,
        configureable: false,
        writable: false
      });
    });

    Record._blacklistFunctions_.forEach((key) => {
      Object.defineProperty(Record, key, {
        value: Record[key],
        enumerable: false,
        configureable: false,
        writable: false
      });
    });

    Object.defineProperty(Record, '_blacklistConfigured', {
      value: true,
      enumerable: false,
      configureable: false,
      writable: false
    });
  }
}

if (Record._blacklistConfigured !== true)
  Record._configureBlacklist();

module.exports = Record;
