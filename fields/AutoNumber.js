const Field = require('./Field');

/* AutoNumber
 * Automatically incremented unique counter for each record.
 * Parameters:
 *   name: <String>
 *   value: <Integer>
 *     default: -1
 *     The value for this field is automatically incremented starting at 1.
 *     The value cannot be changed.
 */
class AutoNumber extends Field {
  constructor(name, value = -1, config) {
    if (value !== -1 && (isNaN(value) || value < 1 || value % 1 !== 0)) {
      const error = new Error(
        `Initialized with a bad value for Field '${name}'. 'value' must be an Integer greater than zero. ` +
        `Received: ${value}`
      );
      error.name = 'UninitializedFieldError';
      throw error;
    }
    super(name, value, config);
    this.type = 'Auto Number';
  }

  /* get _changed
   * Return: <Boolean>
   *   A Boolean representing whether or not this field has changed from its original value.
   *   This function is used by the API.
   */
  get _changed() {
    return false;
  }

  /* get value
   * Return: <Integer>/<null>
   *   An Integer or null if the field is empty (which should never happen with this field).
   */
  get value() {
    return this._value === undefined || this._value === null ? null : this._value;
  }

  /* set _changed
   * This function cannot be used.
   */
  set _changed(_) {
    return;
  }

  /* set value
   * Parameters:
   *   value: <Number>
   *     This value should be set automatically by airtable.
   *     This function should only be used by this API as
   *     the value cannot be changed.
   */
  set value(value = null) {
    if (this._value === undefined || this._value === null)
      this._value = value;
  }
}

module.exports = AutoNumber;

