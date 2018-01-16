const DateField = require('./DateField');

/* CreatedTime
 * A created time field automatically shows the date and time that each record was created.
 * It cannot be edited.
 * Parameters:
 *   Refer to DateField.
 */
class CreatedTime extends DateField {
  constructor(name, value, config) {
    super(name, value, config);
    this._type = 'Created Time';
  }

  /* get changed
   * Return: <Boolean>
   *   A boolean representing whether or not this field has changed from its original value.
   *   This function is used by the API.
   */
  get _changed() {
    return false;
  }

  /* get value
   * Return: <Date>
   *   Refer to DateField get value.
   */
  get value() {
    return super.value || null;
  }

  /* set _changed
   * This function cannot be used.
   */
  set _changed(_) {
    return;
  }

  /* get value
   * Return: <Date>
   *   Refer to DateField set value.
   */
  set value(value) {
    if (super.value === undefined || super.value === null)
      super.value = value;
    else
      this._error(`'value' cannot be changed!`, value);
  }
}

module.exports = CreatedTime;
