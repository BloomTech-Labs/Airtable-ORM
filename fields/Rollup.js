const Field = require('./Field');
const LinkToAnotherRecord = require ('./LinkToAnotherRecord');

// still needs to be done. this is just a copy of Lookup right now

/* Rollup
*  Rollup a field on linked records.
*  Parameters:
*     name: <String>
*     [value: <String>]
*     [options: { table: <String>, field: <String> }]
*/
class Rollup extends Field {
  constructor(name, value, options) {
    super(name, value, options);
    this.type = 'Lookup';
  }

  get link() {
    return this._link;
  }

  set link(link) {
    if (this._link !== undefined)
      throw new Error('LookupError: link cannot be changed!');
    if (!(link instanceof LinkToAnotherRecord))
      throw new Error('LookupError: link must be a LinkToAnotherRecord Object!');
    this._link = link;
  }

  get value() {
    if (this.link === undefined || this.link.value === undefined)
      return;
    if (Array.isArray(this.link.value)) {
      return this.link.value.map((record) => record[this.options.field])
    }
    return this.link.value[this.options.field];
  }

  set value(value) {
    if (value === undefined)
      return;
    console.error("LookupError: The value for a Lookup was attempted to be changed. It doesn't work that way...");
  }
}

module.exports = Rollup;
