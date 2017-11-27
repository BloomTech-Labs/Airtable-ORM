class Field {
  constructor(name, value, options = {}) {
    this.name = name;
    this.value = value;
    this.options = options;
  }

  get name() {
    return this._name;
  }

  get options() {
    return this._options;
  }

  get type() {
    return this._type;
  }

  get value() {
    return this._value;
  }

  set name(name) {
    if (this._checkName(name))
      this._name = name;
  }

  set options(options) {
    if (this.options !== undefined)
      throw new Error('FieldError: Options can not be changed!');
    if (typeof options !== 'object' && !Array.isArray(options))
      throw new Error('FieldError: Expected key-value Object but received a(n) ' + Array.isArray(options) ? 'array' : typeof options + '.');
    this._options = options;
  }

  set type(type) {
    if (this.type !== undefined)
      throw new Error('FieldError: type can not be changed!');
    this._type = type;
  }

  set value(value) {
    this._value = value;
  }

  copy() {
    return new this.constructor(this.name, this.value, this.options);
  }

  _checkName(name) {
    if (typeof name !== 'string' || name.length < 1)
      throw new Error('FieldError: name must be a string with a minimum length of 1 character.');
    return true;
  }

  toString() {
    return `${this.name}: ${this.value.toString()}`;
  }
}

module.exports = Field;
