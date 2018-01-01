const Field = require('./Field');

/* DateField
 * This field stores a Date object.
 * Parameters:
 *   name: <String>
 *   value: <String>
 *   [config: {
 *     dateFormat: <String> 'Local' / 'Friendly' / 'US' / 'European' / 'ISO'
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
 *     timeFormat: <Number>/<String> 12 / 24 / '12' / '24'
 *       default: 12
 *       Format time as 12 hour or 24 hour.
 *       12 (12:03am)
 *       24 (00:00)
 *     includeDay: <Boolean>
 *       default: false
 *       Whether or not to include the day when converting this Field toString().
 *       Airtable does not show the day on their website.
 *       'Local' (Tue 01/02/2018)
 *       'Friendly' (Tuesday, January 2, 2018)
 *       'US' (Tue 01/02/2018)
 *       'European' (Tue 02/01/2018)
 *       'ISO' (2018-01-02)
 *     includeSeconds: <Boolean>
 *       default: false
 *       Whether or not to include the seconds when converting this Field toString().
 *       Airtable does not show the seconds on their website although they do allow seconds
 *       to be saved.
 *       12 (12:03:30am)
 *       24 (00:00:30)
 *   }]
 *     The config determines the behavior of this Field's toString() function. It does not effect
 *     how Date Objects will be saved. Setting includeTime to false will still result in time data
 *     being saved if it is present in the Date Object. However, if the field isn't set to include
 *     the time on Airtable's website, Airtable will ignore the time data.
 */
class DateField extends Field {
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

  static set days(_) {
    return;
  }

  static set months(_) {
    return;
  }

  constructor(name, value, config = {}) {
    if (config.includeTime !== true)
      config.includeTime = false;
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
        throw new Error(`DateFieldError: Unknown dateFormat '${config.dateFormat}' for field '${name}'.`);
    }

    switch (config.timeFormat) {
      case '12':
      case 12:
      case '24':
      case 24:
        break;
      default:
        throw new Error(`DateFieldError: Unknown timeFormat '${config.timeFormat}' for field '${name}'.`);
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

  get _changed() {
    return `${this.value}` !== `${this._originalValue}`;
  }

  get value() {
    return this._value;
  }

  set changed(_) {
    return;
  }

  set value(value) {
    if (value === undefined || value === null)
      return this.value = null;
    if (typeof value === 'string') {
      let date = new Date(value);
      value = value.trim();
      if (value.length === 10)
        date = new Date(value.replace(/-/g, ' '));
      if (date.toString() === 'Invalid Date')
        throw new Error(`DateFieldError: Invalid Date for Field '${this.name}'. Received: ${value} of type ${typeof value}`);
      this._value = date;
    } else if (value instanceof Date) {
      this._value = value;
    } else {
      throw new Error(`DateFieldError: Invalid Date for Field '${this.name}'. Received: ${value} of type ${typeof value}`);
    }
  }

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
      let dateFormat = this.config.dateFormat;
      if (dateFormat === 'Local') {
        dateFormat = 'US';
      }
      switch (dateFormat) {
        case 'Friendly':
          string = `${this.config.includeDay ? `${DateField.days[day]}, ` : ''}${DateField.months[parseInt(month)-1]} ${date}, ${year}`;
          break;
        case 'US':
          string = `${this.config.includeDay ? `${DateField.days[day].substring(0, 3)} ` : ''}${month}/${date}/${year}`;
          break;
        case 'European':
          string = `${this.config.includeDay ? `${DateField.days[day].substring(0, 3)} ` : ''}${date}/${month}/${year}`;
          break;
        case 'Local':
        case 'ISO':
          string = `${year}-${month}-${date}`;
          break;
        default:
          throw new Error(`DateFieldError: Unknown dateFormat '${this.config.dateFormat}' for field '${this.name}'.`);
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
            throw new Error(`DateFieldError: Unknown timeFormat '${this.config.timeFormat}' for field '${this.name}'.`);
        }
      }
    }
    return `${includeName === true ? `${this.name}: ` : ''}${string}`;
  }
}

module.exports = DateField;
