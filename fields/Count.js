const Field = require('./Field');

/* Count *limited support*
 * Count the number of linked Records.
 * This Field will have outdated data as soon as another Field
 * it relies on changes.
 * Parameters:
 *   name: <String>
 *   value: <Number>
 *     The value cannot be changed.
 *   config: {
 *     field: <String>
 *       The Field on this Table that links to the Records
 *       you want to count.
 *   }
 */
class Count extends Field {
  constructor(name, value, config) {
    super(name, value, config);
    this.type = 'Count';
  }

  get _changed() {
    return false;
  }

  get value() {
    return this._value;
  }

  set _changed(_) {
    return;
  }

  set value(value) {
    if (this._value === undefined)
      this._value = value;
    else
      throw new Error(`CountError: Count Fields cannot be modified.`)
  }
}

module.exports = Count;

