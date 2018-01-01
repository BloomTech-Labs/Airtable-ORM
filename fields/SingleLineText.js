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
    return this._value;
  }

  set value(value) {
    if (value === undefined || value === null)
      value = '';
    this._value = `${value}`;
  }
}

module.exports = SingleLineText;

