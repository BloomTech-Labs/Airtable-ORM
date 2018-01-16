const SingleLineText = require('./SingleLineText');

/* URL
 * A valid URL (eg. www.google.com or https://www.amazon.com).
 * Although Airtable says this field should be a valid URL, it can be any string.
 * Parameters:
 *   Refer to SingleLineText
 */
class URL extends SingleLineText {
  constructor(name, value, config) {
    super(name, value, config);
    this._type = 'URL';
  }
}

module.exports = URL;

