const SingleLineText = require('./SingleLineText');

/* PhoneNumber
 *  A telephone number (e.g. (206) 794-6391).
 * Although Airtable says this field should be a telephone number,
 * it can be any string.
 * Parameters:
 *   Refer to SingleLineText
 */
class PhoneNumber extends SingleLineText {
  constructor(name, value, config) {
    super(name, value, config);
    this._type = 'Phone number';
  }
}

module.exports = PhoneNumber;


