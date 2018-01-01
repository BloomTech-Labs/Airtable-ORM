const SingleLineText = require('./SingleLineText');

/* Email
 * A valid email address (eg. andrew@gmail.com).
 * Although Airtable says this field should be a valid email address,
 * it can be any string.
 * Parameters:
 *   Refer to SingleLineText
 */
class Email extends SingleLineText {
  constructor(name, value, config) {
    super(name, value, config);
    this._type = 'Email';
  }
}

module.exports = Email;

