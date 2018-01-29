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

  /* get _changed
   * Return:
   *   Will Always return false.
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

module.exports = Rollup;

