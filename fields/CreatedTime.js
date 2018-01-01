const DateField = require('./DateField');

/* CreatedTime
 * A created time field automatically shows the date and time that each record was created.
 * It cannot be edited.
 * Parameters:
 *   Refer to DateField
 */
class CreatedTime extends DateField {
  constructor(name, value, config) {
    super(name, value, config);
    this._type = 'Created Time';
  }

  get value() {
    return super.value;
  }

  set value(value) {
    if (super.value === undefined || super.value === null)
      super.value = value;
    else
      throw new Error(`CreatedTimeError: value cannot be changed!`);
  }
}

module.exports = CreatedTime;
