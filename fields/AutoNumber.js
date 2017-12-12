const Field = require('./Field');

class AutoNumber extends Field {
  constructor(name, value, options) {
    super(name, value, options);

  }

  get value() {
    return this._value;
  }

  set value(value) {

  }
}
