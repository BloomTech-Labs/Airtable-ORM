const Field = require('./Field');

/* SingleLineText
*  A single line of text. You can optionally prefill each new cell with a default value.
*  Parameters:
*     name: <String>
*     [value: <String>]
*     [options: { default: <String> }]
*/
class SingleLineText extends Field {
  constructor(name, value, options) {
    super(name, value, options);
    this.type = 'Single line text';
  }
}

module.exports = SingleLineText;
