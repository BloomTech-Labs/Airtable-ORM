const Field = require('./Field');

/* UnknownField
*  This is used for a field not found in the original definition.
*  Parameters:
*     name: <String>
*/
class UnknownField extends Field {
  constructor(name, value) {
    super(name, value);
    this.type = 'Unknown field';
  }
}

module.exports = UnknownField;
