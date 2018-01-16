const Field = require('./Field');

/* Formula *limited support*
 * Compute a value in each record based on other fields.
 * in the same record. For more information on formulas and
 * a complete function reference, see the Formula Field
 * Reference on the Airtable website.
 * https://support.airtable.com/hc/en-us/articles/203255215-Formula-Field-Reference
 * This field will have outdated data as soon as another field
 * it relies on changes.
 * Parameters:
 *   name: <String>
 *   value: <String>/<Number>/<Number Array>/<String Array>
 *     The value cannot be changed.
 */
class Formula extends Field {
  constructor(name, value, config) {
    super(name, value, config);
    this.type = 'Formula';
  }

  get _changed() {
    return false;
  }

  get value() {
    return this._value === 0 || this._value === false ? this._value : this._value || null;
  }

  set _changed(_) {
    return;
  }

  set value(value) {
    if (this._value === undefined)
      this._value = value;
    else
      this._error(`Formula Fields cannot be modified.`)
  }
}

module.exports = Formula;

