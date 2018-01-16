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

  get value() {
    return this._value || null;
  }

  set value(value = null) {
    if (value === null)
      value = '';
    if (typeof value !== 'string' && this.config.__strict__ === true)
      return this._error(`'value' must be a String!`, value);
    this._value = `${value}`;
  }
}

module.exports = SingleLineText;

