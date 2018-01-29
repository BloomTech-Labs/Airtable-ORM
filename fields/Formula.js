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

  /* get _changed
   * Return:
   *   Will always be false.
   *   This function is used by the API.
   */
  get _changed() {
    return false;
  }

  /* get value
   * Return:
   *   This field is not fully supported and will return whatever was passed into it.
   */
  get value() {
    return this._value;
  }

  /* set _changed
   * This function cannot be used.
   */
  set _changed(_) {
    return;
  }

  /* set value
   * Return:
   *   This field is not fully supported and can be set to anything.
   */
  set value(value) {
    this._value = value;
  }
}

module.exports = Formula;

