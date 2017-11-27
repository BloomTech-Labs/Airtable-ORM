const Field = require('./Field');

/* Email
*  A valid email address (e.g. andrew@gmail.com).
*  Parameters:
*     name: <String>
*/
class Email extends Field {
  constructor(name, value) {
    super(name, value);
    this.type = 'Email';
  }

}

module.exports = Email;
