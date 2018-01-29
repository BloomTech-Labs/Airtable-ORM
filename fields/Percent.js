const NumberField = require('./NumberField');

/* Percent
 * A field to store a percent value.
 * Parameters:
 *   name: <String>
 *   value: <Number>
 *     default: null
 *     A number representing a percent value. 42% would be passed in as 42.
 *   [config: {
 *     allowNegative: <Boolean>
 *       default: false
 *       Setting allowNegative to anything other than true will result
 *       in allowNegative being set to false.
 *     precision: <Number> 0-7
 *       default: 0
 *       Precision must be an Integer greater than or equal to 0 and less than 8.
 *       Setting precision less than 0 will set it to 0.
 *       Setting the precision greater than 7 will set it to 7.
 *       A precision set to a float will be floored.
 *       A NaN precision will throw an error.
 *   }]
 * Strict:
 *   Throws an error if the value exceeds the precision. Otherwise it will floor
 *   the value at the specified precision level. Value must be a number (ie,
 *   setting the value to '45%' will throw an error)
 */
class Percent extends NumberField {
  constructor(name, value = null, config = {}) {
    config.format = 'Decimal';

    if (config.precision === undefined || config.precision === null)
      config.precision = 0;
    if (config.allowNegative !== true)
      config.allowNegative = false;

    if (isNaN(config.precision)) {
      const error = new Error(
        `'precision' for Field '${name}' was not set to a Number in the config. ` +
        `Received: ${config.precision}`
      );
      error.name = 'UninitializedFieldError';
      throw error;
    }

    config.precision = ~~config.precision;
    if (config.precision < 0)
      config.precision = 0;
    if (config.precision > 7)
      config.precision = 7;

    super(name, value, config);
    this._type = 'Percent';
  }

  /* get value
   * Return:
   *   A Number or Null.
   */
  get value() {
    let decimal = super.value;
    if (isNaN(decimal))
      return null;
    return decimal;
  }

  /* set value
   * Refer to NumberField.set value
   */
  set value(value) {
    let percent = value;
    if (typeof value === 'string') {
      if (this.isStrict)
        return this._error('value must be a number.', value);
      percent = percent.replace(/%/g, '');
    }
    super.value = percent;
  }

  /* toString(includeName)
   * Parameters:
   *   includeName: <Boolean>
   *     Whether or not to include the name of the Field in the String.
   * Return:
   *   A String of the field's name and value unless includeName is set to false.
   *     "name: value%"
   */
  toString(includeName = true) {
    return `${includeName === true ? `${this.name}: ` : ''}${isNaN(this.value) || this.value === null ? this.value : `${this.value}%`}`;
  }
}

module.exports = Percent;
