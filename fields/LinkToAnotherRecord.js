const Field = require('./Field');
const Record = require('../Record');

/* LinkToAnotherRecord
 * This field will link to a record in the specified table.
 * Parameters:
 *   name: <String>
 *   [value: <String>]
 *   config: {
 *     table: <String>
 *       The name of the table this Field should link to.
 *     [multi: <Boolean>]
 *       default: false
 *   }
 */
class LinkToAnotherRecord extends Field {
  constructor(name, value = null, config = {}) {
    if (config.multi !== true)
      config.multi = false;
    if (config.multi === true && value === null)
      value = [];
    if (typeof config.table !== 'string') {
      const error = new Error(
        `'table' for Field '${name}' must be defined in the config. ` +
        `Received: ${{ table: config.table }}`
      );
      error.name = 'UninitializedFieldError';
      throw error;
    }
    super(name, value, config);
    this.type = 'Link to another record';
  }

  get _originalValue() {
    const value = this._originalValue_;
    if (this.isMulti) {
      if (Array.isArray(value))
        return value.map((record) => {
          if (this._isRecord(record))
            return record.id;
          return record;
        })
    }
    if (this._isRecord(value))
      return value.id;
    return value;
  }

  get _saveValue() {
    if (this.value === undefined || this.value === null)
      return null;
    if (this.isMulti)
      return this.value.reduce((array, record) => {
        if (this._isRecord(record))
          array.push(record.id);
        else if (typeof record === 'string')
          array.push(record);
        else
          this._error('Encountered a bad value during save conversion. Expected an Array of String or Record Objects.', this.value, true);
        return array;
      }, []);
    if (typeof this.value === 'string')
      return this.value;
    else if (this._isRecord(this.value))
      return this.value.id;
    this._error('Encountered a bad value during save conversion. Expected a String or Record Object.', this.value, true);
  }

  get isLoaded() {
    let value = this.value;
    if (this.isMulti) {
      let allRecords;
      for (let i = 0 ; i < value; i++) {
        if (allRecords !== false) {
          if (this._isRecord(value[i]))
            allRecords = true;
          else
            allRecords = false;
        }
      }
      return allRecords === true;
    }
    return this._isRecord(value);
  }

  get isMulti() {
    return this.config.multi === true;
  }

  get value() {
    if (this.isMulti) {
      if (!Array.isArray(this._value))
        this._value = [];
    }
    if (this._value === undefined || this._value === null)
      return null;
    return this._deepFreezeValue(this._value);
  }

  set _originalValue(value) {
    this._originalValue_ = value;
  }

  set _saveValue(_) {
    return;
  }

  set isLoaded(_) {
    return;
  }

  set isMulti(_) {
    this._warn(
      'You cannot change whether or not this Field is multi through this API. ' +
      'It can only be done through the Airtable website. If the field is already set to multi on the Airtable ' +
      `website, add 'multi: true' to the field definition.`
    );
  }

  set value(value = null) {
    if (value === null)
      return this._value = this.isMulti ? [] : null;
    if (this.isMulti) {
      if (!Array.isArray(value))
        return this._error('Expected an Array!', value);
      for (let i = 0; i < value.length; i++) {
        if (typeof value[i] === 'string')
          continue;
        if (this._isRecord(value[i]))
          continue;
        return this._error('Expected an Array of Strings or Record Objects.', value);
      }
      return this._value = value;
    }
    if (typeof value === 'string' || this._isRecord(value))
      return this._value = value;
    this._error('Expected a String or Record Object.', value);
  }

  toString(includeName = true) {
    if (Array.isArray(this.value))
      return `${includeName === true ? `${this.name}: ` : ''}${JSON.stringify(this.value.map((record) => {
        if (this._isRecord(record))
          return JSON.parse(record.stringify());
        return record;
    }))}`;
    if (this._isRecord(this.value))
      return this.value.stringify();
    return `${includeName === true ? `${this.name}: ` : ''}${this.value.toString()}`
  }

  /* addRecord
   * Add a record to this field. If the field is not multi, using this function will replace the record that
   * is currently stored. In the instance where record is a string which corresponds to a Record Object's id
   * already stored in this field, record will be ignored and no changes will happen.
   * Parameters:
   *   record: <String>/<Record>
   *     If record is neither a String nor a Record, an error will be thrown. undefined and null are ignored.
   *   setupLinks: <Boolean>
   *     default: true
   *     Whether or not to grab records from Airtable.com that are linked inside of the record
   *     that will be retrieved from Airtable.com in the case that a String is provided.
   *     In the case that a Record Object is provided, no requests will be made to Airtable.com
   *     regardless of what setupLinks is set to.
   */
  addRecord(record = null, setupLinks = true) {
    // in this function I return resolve(this) after using this._error because it should only hit the return
    // statmenet if __ignoreFieldErrors__ is set to true. It returns to ignore the attempted change
    const records = [];
    // this can only find records with some sort of link to this one. There will likely be records
    // existing in memory from the same query that this record has no connection to.
    const knownRecords = {};
    return new Promise((resolve, reject) => {
      const findRecords = (record) => {
        if (!this._isRecord(record) || (typeof knownRecords[record.table.name] === 'object' && this._isRecord(knownRecords[table][id])))
          return;
        if (typeof knownRecords[record.table.name] !== 'object')
          knownRecords[record.table.name] = {};
        knownRecords[record.table.name][record.id] = record;
        Object.entries(record.fields).forEach(([key, field]) => {
          if (field instanceof Field) {
            if (Array.isArray(field.value))
              field.value.forEach(record => this._isRecord(record) ? findRecords(record) : undefined);
            else if (this._isRecord(field.value))
              findRecords(field.value);
          }
        });
      };
      const getKnownRecord = (table, id) => {
        if (typeof knownRecords[table] === 'object' && this._isRecord(knownRecords[table][id]))
          return knownRecords[table][id];
        return null;
      };
      const storeValue = (record) => {
        if (this.isMulti) {
          records.push(record);
          this.value = records;
        } else {
          this.value = record;
        }
      }
      try {
        if (record === null)
          return resolve(this);
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
              storeValue(record);
              return resolve(this);
            } catch (error) {
              reject(error);
            }
          }).catch(reject);
        }
        const value = this.value;
        const rID = getID(record);
        if (rID === undefined) // it will only be undefined if an error was thrown and ignored.
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
          const srID = getID(value); // Stored Record ID
          if (rID === srID)
            return resolve(this);
        }
        if (this._isRecord(record)) {
          storeValue(record);
          return resolve(this);
        }
        const knownRecord = getKnownRecord(this.config.table, rID);
        if (this._isRecord(knownRecord)) {
          storeValue(record);
          return resolve(this);
        }
        requestRecord(rID);
      } catch (error) {
        reject(error);
      }
    });
  }

  /* removeRecord
   * Remove a record from this field. If the record does not exist on this field, nothing will happen.
   * Parameters:
   *   record: <String>/<Record>
   *     If record is neither a String nor a Record, an error will be thrown. undefined and null are ignored.
   */
  removeRecord(record = null) {
    if (record === null)
      return;
    const value = this.value;
    if (value === null)
      return;
    const getID = (record) => {
      if (typeof record === 'string')
        return record;
      if (this._isRecord(value))
        return record.id;
      this._error('Expected record to be a String or a Record Object.', record);
    };
    const rID = getID(record);
    if (rID === undefined)
      return;
    if (this.isMulti) {
      const records = [];
      let foundRecord = false;
      for (let i = 0; i < value.length; i++) {
        const srID = getID(value[i]);
        // return because this will only happen if they set __ignoreFieldErrors__ to true
        // so I return to ignore the attempted change.
        if (srID === undefined)
          return;
        if (rID !== srID)
          records.push(value[i]);
        else
          foundRecord = true;
      }
      if (foundRecord === true)
        return this.value = records;
    }
    const srID = getID(value);
    if (rID === srID)
      this.value = null;
  }
}

module.exports = LinkToAnotherRecord;
