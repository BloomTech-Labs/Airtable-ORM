const Field = require('./Field');

/* SingleLineText
*  A single line of text. You can optionally prefill each new cell with a default value.
*  Parameters:
*     name: <String>
*     [value: <String>]
*     [options: {
*       format: <String> 'Integer'/'Decimal',
*       precision: <Number> 1 - 8,
*       default: <Number>,
*       allowNegative: <Boolean>
*     }]
*/
class NumberField extends Field {
  constructor(name, value, options) {
    super(name, value, options);
    this.type = 'Number';
  }

  get value() {

  }

  set value(value) {
    Number(value);
  }

}

module.exports = NumberField;
