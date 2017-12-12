const Field = require('./Field');

/* DateField
*  This field stores a Date object.
*  Parameters:
*     name: <String>
*     [value: <String>]
*     [options: { table: <String>, field: <String> }]
*/
class DateField extends Field {
  constructor(name, value, options) {
    super(name, value, options);
    this.type = 'Date';
  }
}

module.exports = DateField;
