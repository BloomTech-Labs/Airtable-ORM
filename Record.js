const CreatedTime = require('./fields/CreatedTime');
const DateField = require('./fields/DateField');
const Currency = require('./fields/Currency');
const Field = require('./fields/Field');
const LinkToAnotherRecord = require('./fields/LinkToAnotherRecord');
const Percent = require('./fields/Percent');
const UnknownField = require('./fields/UnknownField');
const Request = require('./Request');

/* Record
 * Parameters:
 *   table: <Table>
 *     The Table that this record belongs to.
 *   id: <String>
 *     The ID of the Record from Airtable.com
 *   createdTime: <String> <Date>
 *     The time this Record was created.
 *   fields: <Object>
 *     A key-value Object of Field Definitions.
 */
class Record {

  /* static get printRecordChanges
   * Return:
   *   A Boolean representing whether or not Record changes will be printed to the console
   *   during a save operation.
   */
  static get printRecordChanges() {
    return this._printRecordChanges;
  }

  /* static set printRecordChanges
   * Parameters:
   *   value:
   *     A Boolean representing whether or not Record changes should be printed to the console
   *     during a save operation.
   */
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
   * This is used to track known Fields so that invalid fields to not
   * get sent during a save request which would throw an error from Airtable.com
   */
  get _knownFields() {
    return this._knownFields_ || {};
  }

  /* get createdTime
   * Return:
   *   A CreatedTime Field with a value representing the time this Record was created.
   */
  get createdTime() {
    return this._createdTime;
  }

  /* get fields
   * Return:
   *   A key-value Object of { key: Field Object } Where the key is the same key used
   *   in the Field Definition. If no key was used in the Field Definition (ie a Field
   *   that wasn't defined but came in from Airtable) then the key will be the name of
   *   the Field as it is on Airtable.com
   */
  get fields() {
    return this._fields;
  }

  /* get id
   * Return:
   *   A String of the ID of the Field from Airtable.com.
   */
  get id() {
    return this._id;
  }

  /* get primaryField
   *   Return:
   *     Returns the value of the Field that is listed as the Primary Field
   *     in the Table Definition.
   */
  get primaryField() {
    return this.getPrimaryField().value;
  }

  /* get table
   * Return:
   *   Returns that Table that this Record is a part of.
   */
  get table() {
    return this._table;
  }

  /* _knownFields
   *  Do not use this!
   * This is used to track known Fields so that invalid fields to not
   * get sent during a save request which would throw an error from Airtable.com
   */
  set _knownFields(fields) {
    const knownFields = {};
    Object.entries(fields).forEach(([key, value]) => {
      knownFields[key] = true;
    })
    this._knownFields_ = knownFields;
  }

  /* set createdTime
   * Parameters:
   *   createdTime: <CreatedTime>
   *     A CreatedTime Field with a value representing the time this Record was created.
   * This cannot be changed once it is set.
   */
  set createdTime(createdTime) {
    if (this.createdTime !== undefined)
      throw new Error('RecordError: createdTime cannot be changed!');
    this._createdTime = createdTime;
  }

  /* set fields
   * Parameters:
   *   fields: <Object>
   *     A key-value Object of initialized Fields with keys matching the Table Definition.
   */
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

  /* set id
   * Parameters:
   *  id: <String>
   *    The ID of this Record from Airtable.com
   * This cannot be changed once it is set.
   */
  set id(id) {
    if (this.id !== undefined)
      throw new Error('RecordError: id cannot be changed!');
    this._id = id;
  }

  /* set primaryField
   * Parameters:
   *   value: <Anything>
   *     The value that the primary Field defined in the Table Definition will accept.
   * This just calls the `set value` from whatever Field is marked aas being the primary Field.
   */
  set primaryField(value) {
    this.getPrimaryField().value = value;
  }

  /* set table
   * Parameters:
   *   table: <Table>
   *     The Table that this Record belongs to.
   */
  set table(table) {
    if (this.table !== undefined)
      throw new Error('RecordError: table cannot be changed!');
    if (typeof table !== 'object' || table._airtable_ === undefined)
      throw new Error("RecordError: Hmm... It doesn't look like you passed in a Table Object.");
    this._table = table;
  }

  /* getFieldByKey(key)
   * Parameters:
   *   key: <String>
   *     The key the was assigned in the Field Definition.
   * Return:
   *   Returns a Field Object or undefined.
   */
  getFieldByKey(key) {
    if (this.fields === undefined || typeof key !== 'string')
      return;
    return this.fields[key];
  }

  /* getFieldByName(name)
   * Parameters:
   *   name: <String>
   *     The name of the Field as it is on Airtable.com
   * Return:
   *   Returns a Field Object or undefined.
   */
  getFieldByName(name) {
    if (this.fields === undefined || typeof name !== 'string')
      return;
    const values = Object.values(this.fields);
    for (let i = 0; i < values.length; i++) {
      const field = values[i];
      if (field.name === name)
        return field;
    }
  }

  /* getPrimaryField()
   * Return:
   *   Returns a Field Object of the primary key defined in the Table Definition or undefined.
   */
  getPrimaryField() {
    if (this.fields === undefined)
      return;
    const entries = Object.entries(this.fields);
    for (let i = 0; i < entries.length; i++) {
      const [key, field] = entries[i];
      if (field.isPrimary())
        return field;
    }
  }

  /* fget(name)
   * Parameters:
   *   name: <String>
   *     The name of the Field as it is on Airtable.com
   * Return:
   *   Returns a Field Object or undefined.
   * This is an alias for Record.getFieldByName
   */
  fget(name) {
    return this.getFieldByName(name);
  }

  /* fgetk(key)
   * Parameters:
   *   key: <String>
   *     The key the was assigned in the Field Definition.
   * Return:
   *   Returns a Field Object or undefined.
   * This is an alias for Record.getFieldByKey
   */
  fgetk(key) {
    return this.getFieldByKey(key);
  }

  /* get(name)
   * Parameters:
   *   name: <String>
   *     The name of the Field as it is on Airtable.com
   * Return:
   *   Returns the value of the Field or undefined.
   */
  get(name) {
    const field = this.getFieldByName(name);
    if (field === undefined)
      return;
    return field.value;
  }

  /* getk(key)
   * Parameters:
   *   key: <String>
   *     The key the was assigned in the Field Definition.
   * Return:
   *   Returns a Field Object or undefined.
   */
  getk(key) {
    const field = this.getFieldByKey(key);
    if (field === undefined)
      return;
    return field.value;
  }

  /* has(name)
   * Parameters:
   *   name: <String>
   *     The name of the Field as it is on Airtable.com
   * Return:
   *   Returns a boolean representing whether or not a Field with the given name exists.
   */
  has(name) {
    return this.getFieldByName(name) !== undefined;
  }

  /* hask(key)
   * Parameters:
   *   key: <String>
   *     The key the was assigned in the Field Definition.
   * Return:
   *   Returns a boolean representing whether or not a Field referenced by the given key exists.
   */
  hask(key) {
    return this.getFieldByKey(key) !== undefined;
  }

  /* put(name, value)
   * Parameters:
   *   name: <String>
   *     The name of the Field as it is on Airtable.com
   *   value: <Anything>
   *     The value of the Field.
   * Sets the value of the field with the given name.
   * Return:
   *   Returns false if the Field did not exist, otherwise it will return true.
   */
  put(name, value) {
    const field = this.getFieldByName(name);
    if (field === undefined)
      return false;
      // throw new Error(`TableError: Field '${key}' does not exist!`);
    field.value = value;
    return true;
  }

  /* putk(key, value)
   * Parameters:
   *   key: <String>
   *     The key the was assigned in the Field Definition.
   *   value: <Anything>
   *     The value of the Field.
   * Sets the value of the field with the given name.
   * Return:
   *   Returns false if the Field did not exist, otherwise it will return true.
   */
  putk(key, value) {
    const field = this.getFieldByKey(key);
    if (field === undefined)
      return false;
      // throw new Error(`TableError: Field '${key}' does not exist!`);
    field.value = value;
    return true;
  }

  /* createRecord(setupLinks)
   * Parameters:
   *   [setupLinks: <Boolean>]
   *     A Boolean representing whether or not to set up LinkToAnotherRecord Fields
   *     on the Record that will be resolved. Setting it to anything other than false
   *     will result in it being set to true.
   * Return:
   *   Returns a Promise which will resolve either a newly created Record or undefined
   *   if the Record failed to be created. It will reject an error from Airtable.com on
   *   a failed create request.
   */
  create(setupLinks = true) {
    setupLinks = setupLinks === true;
    return this.table.createRecord(this, setupLinks);
  }

  /* save(deepSave)
   * Parameters:
   *   [deepSave: <Boolean>]
   *     Whether or not to also run the save operation on any Records stored in a
   *     LinkToAnotherRecord Field on this Record and any Records in those Fields,
   *     should they exist.
   * Return:
   *   Returns a Promise which will resolve this Record after the save operation.
   *   It will reject an error from Airtable.com on a failed save Request.
   * This is an alias for Record.update
   */
  save(deepSave = true) {
    return this.update(deepSave);
  }

  /* update(deepUpdate)
   * Parameters:
   *   [deepUpdate: <Boolean>]
   *     Whether or not to also run the update operation on any Records stored in a
   *     LinkToAnotherRecord Field on this Record and any Records in those Fields,
   *     should they exist.
   * Return:
   *   Returns a Promise which will resolve this Record after the update operation.
   *   It will reject an error from Airtable.com on a failed update Request.
   */
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

  /* stringify(replacer, space)
   * Parameters:
   *   [repalcer: <Function> <Array>]
   *     A function that alters the behavior of the stringification
   *     process, or an array of String and Number objects that serve
   *     as a whitelist for selecting/filtering the properties of the
   *     value object to be included in the JSON string. If this value
   *     is null or not provided, all properties of the object are included
   *     in the resulting JSON string.
   *   [spacer: <String> <Number>]
   *     A String or Number object that's used to insert white space into the
   *     output JSON string for readability purposes. If this is a Number, it
   *     indicates the number of space characters to use as white space; this
   *     number is capped at 10 (if it is greater, the value is just 10). Values
   *     less than 1 indicate that no space should be used. If this is a String,
   *     the string (or the first 10 characters of the string, if it's longer
   *     than that) is used as white space. If this parameter is not provided (or
   *     is null), no white space is used.
   * Return:
   *   A String of all the Fields in a mostly JSON format. LinkToAnotherRecord values will
   *   will be converted to a string like 'Record [TableName : RecordID : PrimaryField Value]'
   * This function just calls JSON.stringify on everything but also handles things that would
   * format incorrectly or cause an error like the loop created in LinkToAnotherRecord Fields.
   */
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

  /* toString()
   * Return:
   *   Returns a String represention of the Record.
   */
  toString() {
    return this.stringify(null, 2);
  }

  /* static _checkField(key)
   * Parameters:
   *   key: <String>
   * Returns:
   *   True if the key for a Field definined in the Table Definition does
   *   match something that is blacklisted. The blacklist exists so that
   *   Fields do not overwrite something that this class is using, as all
   *   Fields get set as propeties on this Object in order to make
   *   'record.fields.age.value' be that same as 'record.age'.
   *   If the key exists on the blacklist then an error will be thrown.
   */
  static _checkField(key) {
    if (Record._blacklist_.indexOf(key) >= 0) {
      throw new Error(`FieldError: Oops! Looks like you managed to pick the same name as an Object that's being used in the Record class. Please pick a name other than '${key}'.`)
    }
    return true;
  }

  /* static _configureBlacklist()
   * This function is used to configure the blacklist when the module
   * is first imported.
   */
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
      'dangerouslyDelete'
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
