const SingleLineText = require('./SingleLineText');

/* LongText
 * A long text field that can span multiple lines.
 * Parameters:
 *   Refer to SingleLineText
 */
class LongText extends SingleLineText {
  constructor(name, value, config) {
    super(name, value, config);
    this._type = 'Long text';
  }
}

module.exports = LongText;

