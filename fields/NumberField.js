const Field = require('./Field');

/* SingleLineText
*  A single line of text. You can optionally prefill each new cell with a default value.
*  Parameters:
*     name: <String>
*     [options: {
*       format: <String> 'Integer'/'Decimal',
*       precision: <Number> 1 - 8,
*       default: <Number>,
*       allowNegative: <Boolean>
*     }]
*/
class SingleLineText extends Field {
  constructor(name, options) {
    super(name, options);
    this.type = 'Number';
  }
}

module.exports = SingleLineText;
