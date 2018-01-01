const Field = require('./Field');

/* Checkbox
 * Automatically incremented unique counter for each record.
 * Parameters:
 *   name: <String>
 *   value: <Boolean>
 *     default: false
 *     Setting this field to 0, '0', undefined, or null will set it to false.
 *     Setting this field to 1 or '1' will set it to true.
 */
class Checkbox extends Field {
  constructor(name, value = false, config) {
    super(name, value, config);
    this.type = 'Checkbox';
  }

  get value() {
    return this._value;
  }

  set value(value) {
    if (value === undefined || value === null)
      return this._value = false;
    if (`${value}` === '0' || `${value}` === '1')
      value = !!Number(value);
    if (typeof value !== 'boolean')
      throw new Error(`CheckboxError: value must be a boolean. Received: '${value}' of type ${typeof value}.`);
    this._value = value;
  }
}

module.exports = Checkbox;

