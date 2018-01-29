const Field = require('./Field');

/* DateField
 * This field stores a Date object.
 * Parameters:
 *   name: <String>
 *   value: <String>
 *   config: {
 *     [dateFormat: <String> 'Local' / 'Friendly' / 'US' / 'European' / 'ISO']
 *       default: 'Local'
 *       How to format the date.
 *       'Local' (01/02/2018)
 *       'Friendly' (January 2, 2018)
 *       'US' (01/02/2018)
 *       'European' (02/01/2018)
 *       'ISO' (2018-01-02)
 *       'Date' (Tue Jan 02 2018 00:00:00 GMT-0700 (Mountain Standard Time))
 *         This option is not available on Airtable's website. It just calls
 *         JavaScript's Date Object's toString() function in place of this field's.
 *     includeTime: <Boolean>
 *       default: false
 *       Whether or not to include the time along with the date.
 *     [timeFormat: <Number>/<String> 12 / 24 / '12' / '24']
 *       default: 12
 *       Format time as 12 hour or 24 hour.
 *       12 (12:03am)
 *       24 (00:00)
 *     [includeDay: <Boolean>]
 *       default: false
 *       Whether or not to include the day when converting this Field toString().
 *       Airtable does not show the day on their website.
 *       'Local' (Tue 01/02/2018)
 *       'Friendly' (Tuesday, January 2, 2018)
 *       'US' (Tue 01/02/2018)
 *       'European' (Tue 02/01/2018)
 *       'ISO' (2018-01-02)
 *     [includeSeconds: <Boolean>]
 *       default: false
 *       Whether or not to include the seconds when converting this Field toString().
 *       Airtable does not show the seconds on their website although they do allow seconds
 *       to be saved.
 *       12 (12:03:30am)
 *       24 (00:00:30)
 *   }
 * Strict:
 *   Will throw an error if the value is set to anything other than a Date Object.
 *   undefined or null will still clear the field.
 */
class DateField extends Field {
  /* static get days
   * Return: <Array>
   *   An Array of the days of the week fully spelled out (ie. 'Sunday')
   *   beginning with Sunday.
   */
  static get days() {
    return [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];
  }

  /* static get months
   * Return: <Array>
   *   An Array of the months of the year fully spelled out (ie. 'January')
   *   beginning with January.
   */
  static get months() {
    return [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
  }

  /* static set days
   * This function cannot be used.
   */
  static set days(_) {
    return;
  }

  /* static set months
   * This function cannot be used.
   */
  static set months(_) {
    return;
  }

  constructor(name, value, config = {}) {
    if (typeof config.includeTime !== 'boolean') {
      const error = new Error(
        `DateField: includeTime must be a boolean.\n` +
        `Airtable.com will not accept normal timestamps and the API needs to know how to save this field if it changes.\n` +
        `Received: ${config.includeTime}`
      );
      error.name = 'UninitializedFieldError';
      throw error;
    }

    if (config.includeDay !== true)
      config.includeDay = false;
    if (config.includeSeconds !== true)
      config.includeSeconds = false;
    if (config.dateFormat === undefined || config.dateFormat === null)
      config.dateFormat = 'Local';
    if (config.timeFormat === undefined || config.timeFormat === null)
      config.timeFormat = 12;

    switch (config.dateFormat) {
      case 'Local':
      case 'Friendly':
      case 'US':
      case 'European':
      case 'ISO':
      case 'Date':
        break;
      default:
        const error = new Error(
          `Unknown dateFormat in the config for Field '${name}'. ` +
          `Received: ${config.dateFormat}`
        );
        error.name = 'UninitializedFieldError';
        throw error;
    }

    switch (config.timeFormat) {
      case '12':
      case 12:
      case '24':
      case 24:
        break;
      default:
        const error = new Error(
          `Unknown timeFormat in the config for Field '${name}'. ` +
          `Received: ${config.timeFormat}`
        );
        error.name = 'UninitializedFieldError';
        throw error;
    }

    if (typeof value === 'string') {
      if (value.length === 10)
        value = new Date(value.replace(/-/g, ' '));
      else
        value = new Date(value);
    }

    super(name, value, config);
    this.type = 'Date';
  }

  /* get changed
   * Return: <Boolean>
   *   A boolean representing whether or not this field has changed from its original value.
   *   This function is used by the API.
   */
  get _changed() {
    if (!(this._originalValue instanceof Date))
      return `${this._saveValue}` !== `${this._originalValue}`;
    return `${this._saveValue}` !== `${this.config.includeTime ? this._originalValue.toISOString() : this._originalValue.toISOString().split('T')[0]}`;
  }

  /* get _saveValue
   * Return:
   *   This function is used by the API to convert the value stored in this field over to a value
   *   that Airtable.com will accept (if it needs to convert anything).
   */
  get _saveValue() {
    if (!(this.value instanceof Date))
      return this.value;
    return this.config.includeTime ? this.value.toISOString() : this.value.toISOString().split('T')[0];
  }

  /*
   * Return:
   *  Returns a Date Object or null.
   */
  get value() {
    return this._value || null;
  }

  /* set _changed
   * This function cannot be used.
   */
  set _changed(_) {
    return;
  }

  /* set _changed
   * This function cannot be used.
   */
  set _saveValue(_) {
    return;
  }

  /* set value
   * Parameters:
   *   value: <Date> <String>
   * undefined or null will clear this field.
   */
  set value(value = null) {
    if (value === null)
      return this._value = null;
    if (typeof value === 'string' && this.isStrict)
      return this._error('value must be a Date Object.', value);
    if (typeof value === 'string') {
      let date = new Date(value);
      value = value.trim();
      if (value.length === 10)
        date = new Date(value.replace(/-/g, ' '));
      if (date.toString() === 'Invalid Date')
        return this._error('Invalid Date', value);
      this._value = date;
    } else if (value instanceof Date) {
      this._value = value;
    } else {
      return this._error('Invalid Date', value);
    }
  }


  /* toString(includeName)
   * Parameters:
   *   includeName: <Boolean>
   *     Whether or not to include the name of the Field in the String.
   * Return:
   *   A String of the field's name and value unless includeName is set to false.
   *     "name: value"
   * The config for this field decides how the Date will be converted to a string.
   * 'Friendly': "Tuesday, November 1, 2007 12:04:50pm"
   * 'US': "Tue 11/01/2006 12:04:50pm"
   * 'Local': Same as US
   * 'European': "Tue 01/11/2006 12:04:50pm"
   * 'ISO': "Tue 11-01-2006 12:04:50pm"
   */
  toString(includeName = true) {
    if (this.config.dateFormat === 'Date')
        return super.toString(includeName);
    let string = undefined;
    if (this.value instanceof Date) {
      const padNum = (num) => {
        return `${num}`.padStart(2, '0');
      }
      const month = padNum(this.value.getMonth() + 1);
      const year = this.value.getFullYear();
      const date = padNum(this.value.getDate());
      const day = this.value.getDay();
      const hour = this.value.getHours();
      const minute = padNum(this.value.getMinutes());
      const second = padNum(this.value.getSeconds());
      switch (this.config.dateFormat) {
        case 'Friendly':
          string = `${this.config.includeDay ? `${DateField.days[day]}, ` : ''}${DateField.months[parseInt(month)-1]} ${date}, ${year}`;
          break;
        case 'Local':
        case 'US':
          string = `${this.config.includeDay ? `${DateField.days[day].substring(0, 3)} ` : ''}${month}/${date}/${year}`;
          break;
        case 'European':
          string = `${this.config.includeDay ? `${DateField.days[day].substring(0, 3)} ` : ''}${date}/${month}/${year}`;
          break;
        case 'ISO':
          string = `${year}-${month}-${date}`;
          break;
        default:
          return this._error(`Unknown dateFormat in config.`, this.config.dateFormat);
      }
      if (this.config.includeTime === true) {
        if (typeof string !== 'string')
          string = '';
        else
          string += ' ';
        switch (this.config.timeFormat) {
          case 12:
          case '12':
            string += `${padNum((hour > 12 ? hour - 12 : hour) || 12)}:${minute}${this.config.includeSeconds ? `:${second}` : ''}${hour > 12 ? 'pm' : 'am'}`;
            break;
          case 24:
          case '24':
            string += `${padNum(hour)}:${minute}${this.config.includeSeconds ? `:${second}` : ''}`;
            break;
          default:
            return this._error(`Unknown timeFormat in config.`, this.config.timeFormat);
        }
      }
    }
    return `${includeName === true ? `${this.name}: ` : ''}${string}`;
  }
}

module.exports = DateField;
