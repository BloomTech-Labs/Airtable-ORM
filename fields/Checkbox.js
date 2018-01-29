const Field = require('./Field');

/* Checkbox
 * A single checkbox that can be checked or unchecked.
 * Parameters:
 *   name: <String>
 *   value: <Boolean>
 *     default: false
 *     Setting this field to 0, '0', undefined, or null will set it to false.
 *     Setting this field to 1 or '1' will set it to true.
 * Strict: value must be a Boolean. Numbers will throw an error.
 */
class Checkbox extends Field {
  constructor(name, value = false, config) {
    super(name, value, config);
    this.type = 'Checkbox';
  }

  /* get value
   * Return: <Boolean>
   *   Whether or not the checkbox is checked.
   */
  get value() {
    return this._value === true;
  }

  /* set value
   * Parameters:
   *   value: <Boolean>
   *     Whether or not the checkbox is checked.
   *     undefined or null will be set to false.
   *     '0' or 0 will be set to false.
   *     '1' or 1 will be set to true.
   */
  set value(value) {
    if (value === undefined || value === null)
      return this._value = false;
    if (this.isStrict && typeof value !== 'boolean')
      return this._error(`'value' must be a boolean.`, value);
    if (`${value}` === '0' || `${value}` === '1')
      value = !!Number(value);
    if (typeof value !== 'boolean')
      return this._error(`'value' must be a boolean.`, value);
    this._value = value;
  }
}

module.exports = Checkbox;

