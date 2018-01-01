const Field = require('./Field');

/* Rollup *limited support*
 * A rollup allos you to summarize data from records that
 * are linked to this table. For more information on rollups
 * and a complete function reference, see the Rollup
 * Field Reference on the Airtable website.
 * https://support.airtable.com/hc/en-us/articles/202576599-Rollup-Field-Reference
 * This field will have outdated data as soon as another field
 * it relies on changes.
 * Parameters:
 *   name: <String>
 *   value: <Number>
 *     The value cannot be changed.
 */
class Rollup extends Field {
  constructor(name, value, config) {
    super(name, value, config);
    this.type = 'Rollup';
  }

  get _changed() {
    return false;
  }

  get value() {
    return this._value;
  }

  set _changed(_) {
    return;
  }

  set value(value) {
    if (this._value === undefined)
      this._value = value;
    else
      throw new Error(`RollupError: Rollup Fields cannot be modified.`)
  }
}

module.exports = Rollup;

