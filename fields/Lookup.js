const Field = require('./Field');
const LinkToAnotherRecord = require ('./LinkToAnotherRecord');

/* Lookup
*  Lookup a field on linked records.
*  Parameters:
*     name: <String>
*     value: <String>
*     [config: { table: <String>, field: <String> }]
*/
class Lookup extends Field {
  constructor(name, value, config) {
    super(name, value, config);
    this.type = 'Lookup';
  }

  get _changed() {
    return false;
  }

  get isLinked() {
    return this.link instanceof LinkToAnotherRecord;
  }

  get isLoaded() {
    if (!this.isLinked)
      return false;
    return this.link.isLoaded;
  }

  get link() {
    return this._link;
  }

  get value() {
    if (!(this.link instanceof LinkToAnotherRecord)) {
      if (this._value === undefined)
        return null;
      return this._deepFreezeValue(this._value);
    }
    if (this.link.isMulti) {
      for (let i = 0; i < this.link.value.length; i++) {
        if (this.link.value[i].constructor.name !== 'Record')
          return this._deepFreezeValue(this._value);
      }
      return this._deepFreezeValue(this.link.value);
    }
    let value = this.link.value;
    if (value.constructor.name === 'Record')
      return this._deepFreezeValue(value.value)
    // if the value constructor name isn't 'Record' then the query probably wasn't set to
    // setupLinks. In this case it will just return whatever Airtable sent.
    return this._deepFreezeValue(this._value);
  }

  set _changed(_) {
    return;
  }

  set isLinked(_) {
    return;
  }

  set isLoaded(_) {
    return;
  }

  set link(link) {
    if (this._link !== undefined)
      return this._warn('link cannot be changed!');
    if (!(link instanceof LinkToAnotherRecord))
      return this._error('link must be a LinkToAnotherRecord Object!', link);
    this._link = link;
  }

  // this is used when the field is initialized and should only be used if you don't setupLinks
  // in the query.
  set value(value = null) {
    if (value === null)
      return this._value = null;
    this._value = this._deepFreezeValue(value);
  }
}

module.exports = Lookup;
