const Field = require('./Field');

/* UnknownField
 * This is used for a field not found in the original Table definition.
 * Parameters:
 *    name: <String>
 *    [value: <String>]
 */
class UnknownField extends Field {
  constructor(name, value, config) {
    super(name, value, config);
    this.type = 'Unknown field';
  }
}

module.exports = UnknownField;
