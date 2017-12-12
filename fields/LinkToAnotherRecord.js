const Field = require('./Field');
const Record = require('../Record');

/* LinkToAnotherRecord
*  This field will link to a record in the specified table.
*  Parameters:
*     name: <String>
*     [value: <String>]
*     [options: { table: <String>, multi: <Boolean> }]
*/
class LinkToAnotherRecord extends Field {
  constructor(name, value, options) {
    super(name, value, options);
    this.type = 'Link to another record';
    if(this.isMulti && this.value === undefined)
      this.value = [];
  }

  get isMulti() {
    return this.options.multi || false;
  }

  set isMulti(value) {
    throw new Error('LinkToAnotherRecordError: You cannot define whether or not this Field is multi through this API. It can only be done through the Airtable website.');
  }

  get value() {
    return this._value;
  }

  set value(value) {
    if (value === undefined)
      return;
    if (this._value !== undefined)
      throw new Error('LinkToAnotherRecordError: value cannot be changed! You must modify the value of a Record that this Object returns from <this>.value.' +
        'Note that the value of this Object might be an array of Records.');
    this._value = value;
  }

  toString() {
    if (Array.isArray(this.value))
      return JSON.stringify(this.value.map(record => JSON.parse(record.stringify())), null, 2);
    return this.value.stringify(null, 2);
  }
}

module.exports = LinkToAnotherRecord;
