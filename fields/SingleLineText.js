const Field = require('./Field');

/* SingleLineText
*  A single line of text. You can optionally prefill each new cell with a default value.
*  Parameters:
*     name: <String>
*     [options: { default: <String> }]
*/
class SingleLineText extends Field {
  constructor(name, options) {
    super(name, options);
    this.type = 'Single line text';
  }
}

module.exports = SingleLineText;
