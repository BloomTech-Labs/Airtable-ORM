const NumberField = require('./NumberField');

/* Rating
 * A rating between 0 & 10
 * Parameters:
 *   name: <String>
 *   value: <Number>
 *     default: 0
 *     An Integer greater than or equal to 0 and less than or equal
 *     to the max value. A value less than 0 will be set to 0. A value
 *     greater than the max value will be set to the max value.
 *     Floats will be floored. Undefined and null will be set to 0.
 *   [config: {
 *     max: <Number>
 *       default: 5
 *       An Integer greater than 0 and less than 11. A max value less than
 *       1 will be set to 1. A max value greater than 10 will be set to 10.
 *       Floats will be floored.
 *   }]
 * Strict:
 *   Value must be an Integer no less than 0 and no greater than the max value
 *   defined in the config. Anything else, besides undefined and null, will
 *   throw an error.
 */
class Rating extends NumberField {
  constructor(name, value, config = {}) {
    if (value === undefined || value === null)
      value = 0;
    if (config.max === undefined || config.max === null)
      config.max = 5;
    if (isNaN(config.max)) {
      const error = new Error(
        `'max' for Field '${name}' was not set to a Number in the config. ` +
        `Received: ${config.max}`
      );
      error.name = 'UninitializedFieldError';
      throw error;
    }
    if (isNaN(value)) {
      const error = new Error(
        `'value' for Field '${name}' was not set to a Number. ` +
        `Received: ${value}`
      );
      error.name = 'UninitializedFieldError';
      throw error;
    }
    value = ~~Number(value);
    config.max = ~~Number(config.max);

    if (config.max < 1)
      config.max = 1;
    if (config.max > 10)
      config.max = 10;
    if (value < 0)
      value = 0;
    if (value > config.max)
      value = config.max;

    config.format = 'Integer';

    super(name, value, config);
    this._type = 'Rating';
  }

  get value() {
    return super.value || 0;
  }

  set value(value = null) {
    if (value === null)
      value = 0;
    if (isNaN(value))
      return this._error(`'value' was not set to a Number.`, value)
    if (this.config.__strict__ === true && (typeof value !== 'number' || value !== ~~value || value < 0 || value > this.config.max))
      return this._error(`'value' must be an Integer no less than 0 and no greater than the max value defined in the config.`, value);
    value = ~~Number(value);
    if (value < 0)
      value = 0;
    if (value > this.config.max)
      value = this.config.max;
    super.value = value;
  }

  toStars() {
    if (isNaN(this.value))
      this.value = 0;
    return ''.padStart(~~this.value, '★').padEnd(~~this.config.max, '✰');
  }
}

module.exports = Rating;
