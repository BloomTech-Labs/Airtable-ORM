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
 *   }]
 * Strict:
 *   Throws an error if the value exceeds the precision. Otherwise it will floor
 *   the value at the specified precision level.
 */
class Currency extends NumberField {
  constructor(name, value, config = {}) {
    config.format = 'Decimal';

    if (typeof config.currencySymbol !== 'string')
      config.currencySymbol = '$';
    if (config.currencySymbol.length > 100) {
      console.warn(
        `CurrencyWarning: The Field '${name}' had a symbol which exceeded the maximum character limit (on Airtable.com) of 100. ` +
        `Trimming the symbol and continuing...`
      )
      config.currencySymbol = config.currencySymbol.substring(0, 100);
    }
    if (config.precision === undefined || config.precision === null)
      config.precision = 2;

    super(name, value, config);
    this._type = 'Currency';
  }

  /* get value
   * Refer to NumberField get value (Decimal).
   */
  get value() {
    // can't just return 'super.value || null' because it would return null for a value of 0.
    return super.value === 0 ? super.value : super.value || null;
  }

  /* set value
   * Refer to NumberField set value (Decimal).
   * Note that you can set this value using with the currencySymbol defined in the config attached.
   * ie. $5.13 or $ 5.13.
   */
  set value(value) {
    let curr = value;
    if (this.config.precision < 0 || this.config.precision > 8)
      return this._error('Unknown precision.', this.config.precision);
    if (isNaN(curr) && typeof curr === 'string' && curr.startsWith(this.config.currencySymbol))
      curr = Number(curr.substring(this.config.currencySymbol.length).trim());
    if (isNaN(curr))
      return this._error('Invalid value.', value);
    super.value = curr;
  }

  /* toString
   * Return: <String>
   *   Returns a string in the following format 'My Money: $5.10' where 'My Money' is the name of the field and
   *   $ and .10 are the currencySymbol and precision defined in the config.
   */
  toString(includeName = true) {
    if (isNaN(this.value))
      return super.toString(includeName);
    return `${includeName === true ? `${this.name}: ` : ''}${this.config.currencySymbol}${typeof this.value === 'number' && !isNaN(this.value) ? this.value.toFixed(this.config.precision) : this.value}`;
  }
}

module.exports = Currency;
