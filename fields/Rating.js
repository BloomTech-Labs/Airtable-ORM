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
 *     Floats will be floored.
 *   [config: {
 *     max: <Number>
 *       default: 5
 *       An Integer greater than 0 and less than 11. A max value less than
 *       1 will be set to 1. A max value greater than 10 will be set to 10.
 *       Floats will be floored.
 *   }]
 */
class Rating extends NumberField {
  constructor(name, value, config = {}) {
    if (value === undefined || value === null)
      value = 0;
    if (config.max === undefined || config.max === null)
      config.max = 5;
    if (isNaN(config.max))
      throw new Error(`RatingError: Max rating for Field '${name}' was not set to a Number. Received: '${config.max}' of type ${typeof config.max}`)
    if (isNaN(value))
      throw new Error(`RatingError: value for Field '${name}' was not set to a Number. Received: '${value}' of type ${typeof value}`)
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
    return super.value;
  }

  set value(value) {
    if (value === undefined || value === null)
      value = 0;
    if (isNaN(value))
      throw new Error(`RatingError: value for Field '${name}' was not set to a Number. Received: '${value}' of type ${typeof value}`)
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
