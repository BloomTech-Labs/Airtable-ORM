const Field = require('./Field');

/* SingleLineText
 * A single line of text.
 * Parameters:
 *   name: <String>
 *   value: <String>
 *     default: ''
 *     Setting this field to null or undefined will result in it being set to ''.
 *     Any other value which isn't a string will be set to one using `${value}`
 *     which calls the Object's toString() function.
 * Strict:
 *   Value must be set to a string. Anything else, other than undefined or null, will
 *   throw an error.
 */
class SingleLineText extends Field {
  constructor(name, value, config) {
    if (value === undefined || value === null)
      value = '';
    value = `${value}`;
    super(name, value, config);
    this.type = 'Single line text';
  }

  /* get value
   * Return:
   *   A String.
   */
  get value() {
    return this._value || '';
  }

  /* set value
   * Parameters:
   *   value: <String>
   *     A String to set the value of this Field to. undefined and null will be set to
   *     an empty String. Anything else will be set to a String via a template literal,
   *     except for in Strict.
   * Strict:
   *   An error will be throw if the value is anything other than a String. undefined and null
   *   will still be set to empty Strings.
   */
  set value(value = null) {
    if (value === null)
      value = '';
    if (typeof value !== 'string' && this.isStrict)
      return this._error(`'value' must be a String!`, value);
    this._value = `${value}`;
  }
}

module.exports = SingleLineText;

