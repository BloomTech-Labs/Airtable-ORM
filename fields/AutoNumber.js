const Field = require('./Field');

/* AutoNumber
 * Automatically incremented unique counter for each record.
 * Parameters:
 *   name: <String>
 *   value: <Number>
 *     default: -1
 *     The value for this field is automatically incremented starting at 1.
 *     The value cannot be changed.
 */
class AutoNumber extends Field {
  constructor(name, value = -1, config) {
    if (value !== -1 && (isNaN(value) || value < 1 || value % 1 !== 0))
      throw new Error(`AutoNumberError: AutoNumber was initialized with a bad value. value must be an Integer greater than zero. Received: ${value}`);
    super(name, value, config);
    this.type = 'Auto Number';
  }

  get value() {
    return this._value;
  }

  set value(value) {
    if (this._value === undefined)
      this._value = value;
  }
}

module.exports = AutoNumber;

