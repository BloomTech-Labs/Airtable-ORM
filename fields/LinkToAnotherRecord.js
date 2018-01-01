const Field = require('./Field');
const Record = require('../Record');

/* LinkToAnotherRecord
 * This field will link to a record in the specified table.
 * Parameters:
 *   name: <String>
 *   [value: <String>]
 *   [config: {
 *     table: <String>
 *     multi: <Boolean>
 *   }]
 */
class LinkToAnotherRecord extends Field {
  constructor(name, value = null, config = {}) {
    if (config.multi === true && value === null)
      value = [];
    super(name, value, config);
    this.type = 'Link to another record';
  }

  get _originalValue() {
    const value = this._originalValue_;
    if (this.isMulti) {
      if (Array.isArray(value))
        return value.map((record) => {
          if (typeof record === 'object' && record !== null && record.constructor.name === 'Record')
            return record.id;
          return record;
        })
    }
    if (typeof value === 'object' && value !== null && value.constructor.name === 'Record')
      return value.id;
    return value;
  }

  get _saveValue() {
    if (this.value === undefined || this.value === null)
      return null;
    if (this.isMulti)
      return this.value.reduce((array, record) => {
        if (typeof record === 'object' && record !== null && record.constructor.name === 'Record')
          array.push(record.id);
        else if (typeof record === 'string')
          array.push(record);
        else
          this._error('Encountered a bad value during save conversion. Expected an Array of String or Record Objects.', this.value, true);
        return array;
      }, []);
    if (typeof this.value === 'string')
      return this.value;
    else if (typeof record === 'object' && record !== null && record.constructor.name === 'Record')
      return this.value.id;
    this._error('Encountered a bad value during save conversion. Expected a String or Record Object.', this.value, true);
  }

  get isLoaded() {
    let value = this.value;
    if (this.isMulti) {
      let allRecords;
      for (let i = 0 ; i < value; i++) {
        if (allRecords !== false) {
          const record = value[i];
          if (typeof record === 'object' && record !== null && record.constructor.name === 'Record')
            allRecords = true;
          else
            allRecords = false;
        }
      }
      return allRecords === true;
    }
    return typeof value === 'object' && value !== null && value.constructor.name === 'Record';
  }

  get isMulti() {
    return this.config.multi === true;
  }

  get value() {
    if (this.isMulti) {
      if (!Array.isArray(this._value))
        this._value = [];
    }
    if (this._value === undefined)
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

  set value(value) {
    if (value === undefined || value === null)
      return this._value = this.isMulti ? [] : null;
    if (this.isMulti) {
      if (!Array.isArray(value))
        return this._error('Expected an Array!', value);
      for (let i = 0; i < value.length; i++) {
        if (typeof value[i] === 'string')
          continue;
        if (typeof value[i] === 'object' && value[i] !== null && value[i].constructor.name === 'Record')
          continue;
        return this._error('Expected an Array of Strings or Record Objects.', value);
      }
      return this._value = value;
    }
    if (typeof value === 'string' || (typeof record === 'object' && record !== null && record.constructor.name === 'Record'))
      return this._value = value;
    this._error('Expected a String or Record Object.', value);
  }

  toString(includeName = true) {
    if (Array.isArray(this.value))
      return `${includeName === true ? `${this.name}: ` : ''}${JSON.stringify(this.value.map((record) => {
        if (typeof record === 'object' && record !== null && record.constructor.name === 'Record')
          return JSON.parse(record.stringify());
        return record;
    }))}`;
    if (typeof record === 'object' && record !== null && record.constructor.name === 'Record')
    return this.value.stringify();
    return `${includeName === true ? `${this.name}: ` : ''}${this.value.toString()}`
  }

  // Due to limitations with importing classes, since I need to import field classes in Table and I need Table to do queries,
  // I had to add the function addRecord in the Table class. You will find another version of addRecord in that classes query function
  // which will replace the one in this class. The one in this class is here in case this field is created outside of a query
  // which should only happen if a user creates this class somewhere else. In that case, the user should use the following method to
  // get an addRecord which can accept a record ID as a string and return a promise which will request that record from Airtable:
  // const table = Airtable.getTable(key, name, base); or
  // const table = airtable.getTable(name, base);
  // table.__addAddRecordFunction__(<this>, setupLinks);
  /* addRecord
   * Add a record to this field. If the field is not multi, using this function will replace the record that is currently stored.
   * In the instance where record is a string which corresponds to a Record Object's id
   * already stored in this field, record will be ignored and no changes will happen.
   * Parameters:
   *   record: <String>/<Record>
   *     If record is neither a String nor a Record, an error will be thrown. undefined and null are ignored.
   * Strict:
   *   If the field is not multi and there is already a record stored, an error will be thrown.
   */
  addRecord(record = null) {
    if (record === null)
      return;
    const value = this.value;
    if (this.config.__strict__ === true && !this.isMulti && value !== null)
      return this._error('There is already a record stored in this field.');
    const getID = (record) => {
      if (typeof record === 'string')
        return record;
      if (typeof record === 'object' && record !== null && record.constructor.name === 'Record')
        return record.id;
      this._error('Expected record to be a String or a Record Object.', record);
    };
    const rID = getID(record);
    if (rID === undefined)
      return;
    if (this.isMulti) {
      const records = [record];
      for (let i = 0; i < value.length; i++) {
        const srID = getID(value[i]);
        // return because this will only happen if they set __ignoreFieldErrors__ to true
        // so I return to ignore the attempted change.
        if (srID === undefined)
          return;
        if (rID !== srID)
          records.push(value[i]);
      }
      return this.value = records;
    }
    if (value === null)
      return this.value = record;
    const srID = getID(value);
    if (rID !== srID)
      this.value = record;
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
      if (typeof record === 'object' && record !== null && record.constructor.name === 'Record')
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
