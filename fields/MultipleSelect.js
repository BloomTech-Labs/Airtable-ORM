const Field = require('./Field');

/* MultipleSelect
 * Multiple select allows you to select one or more predefined options
 * listed below.
 * Parameters:
 *   name: <String>
 *   value: <String Array>
 *     default: []
 *   config: {
 *     options: <String Array>
 *       An array of valid options. This is required as sending an invalid option to Airtable
 *       will throw a 422 error.
 *   }
 */
class MultipleSelect extends Field {
  constructor(name, value = [], config = {}) {
    if (config.options === undefined)
      config.options = [];
    if (!Array.isArray(config.options)) {
      const error = new Error(
        `Expected config.options to be an Array in Field '${name}'. ` +
        `Received: ${config.options}`
      );
      error.name = 'UninitializedFieldError';
      throw error;
    } else {
      config.options.forEach((option) => {
        if (typeof option !== 'string') {
          const error = new Error(
            `Expected config.options to be an Array in Field '${name}'. ` +
            `Received: ${config.options}`
          );
          error.name = 'UninitializedFieldError';
          throw error;
        }
      });
    }
    super(name, value, config);
    this.type = 'Multiple select';
  }

  get options() {
    return [...this.config.options];
  }

  get value() {
    if(!Array.isArray(this._value))
      this._value = this._deepFreezeValue([]);
    return this._deepFreezeValue(this._value === 0 || this._value === false ? this._value : this._value || null);
  }

  set options(_){
    return;
  }

  set value(value = null) {
    if (value === null) {
      return this._value = this._deepFreezeValue([]);
    }
    if (!Array.isArray(this.options))
      return this._error('Expected config.options to be an Array.', this.options);
    if (!Array.isArray(value))
      return this._error('Expected value to be an Array.', value);
    for (let i = 0; i < value.length; i++)
      if (this.options.indexOf(value[i]) < 0)
        return this._error('Selected option is not defined in the config.', value[i]);
    this._value = this._deepFreezeValue(value);
  }

  deselectOption(...selections) {
    const value = [];
    this.value.forEach((option) => {
      if (selections.indexOf(option) < 0)
        value.push(option);
    });
    this.value = value;
  }

  optionIsSelected(option) {
    return this.value.indexOf(option) >= 0;
  }

  selectOption(...selections) {
    const value = [...this.value];
    selections.forEach((option) => {
      if (value.indexOf(option) < 0)
        value.push(option);
    });
    this.value = value;
  }
}

module.exports = MultipleSelect;
