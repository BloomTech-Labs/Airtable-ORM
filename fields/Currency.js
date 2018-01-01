const NumberField = require('./NumberField');

/* Currency
 * A single line of text. You can optionally prefill each new cell with a default value.
 * Parameters:
 *   name: <String>
 *   [value: <String>]
 *   [config: {
 *     currencySymbol: <String>
 *       default: '$'
 *       The symbol which precedes the currency.
 *       Although it's meant to be a symbol which would infer a single character,
 *       Airtable supports up to 100 characters.
 *     allowNegative: <Boolean>
 *       default: false
 *       Setting allowNegative to anything other than true will result
 *       in allowNegative being set to false.
 *     precision: <Number> 0-8
 *       default: 2
 *       Precision must be an Integer greater than 0 and less than 9.
 *       Setting precision less than 0 will result in it being set to 0.
 *       Setting the precision greater than 8 will result in it being set to 8.
 *       A precision set to a float will be floored.
 *       A NaN precision will throw an error.
 *     strict: <Boolean>
 *       default: false
 *       Throws an error if the value exceeds the precision. Otherwise it will floor
 *       the value at the specified precision level.
 *   }]
 */
class Currency extends NumberField {
  constructor(name, value, config = {}) {
    config.format = 'Decimal';

    if (typeof config.currencySymbol !== 'string')
      config.currencySymbol = '$';
    if (config.currencySymbol.length > 100) {
      console.warn(
        `CurrencyWarning: The Field '${name}' had a symbol which exceeded the maximum character limit of 100. ` +
        `Trimming the symbol and continuing...`
      )
      config.currencySymbol = config.currencySymbol.substring(0, 100);
    }
    if (config.precision === undefined || config.precision === null)
      config.precision = 2;

    super(name, value, config);
    this._type = 'Currency';
  }

  get value() {
    return super.value;
  }

  set value(value) {
    if (this.config.precision < 0 || this.config.precision > 8)
      throw new Error(`CurrencyError: Unknown precision '${this.config.precision}' in Field '${this.name}'.`);
    if (isNaN(value) && typeof value === 'string' && value.startsWith(this.config.currencySymbol))
      value = value.substring(0, this.config.currencySymbol.length).trim();
    super.value = value;
  }

  toString(includeName = true) {
    if (isNaN(this.value))
      return super.toString(includeName);
    return `${includeName === true ? `${this.name}: ` : ''}${this.config.currencySymbol}${this.value.toFixed(this.config.precision)}`;
  }
}

module.exports = Currency;
