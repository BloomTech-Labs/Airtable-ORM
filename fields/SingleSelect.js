const MultipleSelect = require('./MultipleSelect');

/* SingleSelect
 * Single select allows you to select one or more predefined options
 * listed below.
 * This Field will have outdated data as soon as another Field
 * it relies on changes.
 * Parameters:
 *   name: <String>
 *   value: <String>
 *     default: null
 *   config: {
 *     options: <String Array>
 *       An array of valid options. This is required as sending an invalid option to Airtable
 *       will throw a 422 error.
 *   }
 */
class SingleSelect extends MultipleSelect {
  constructor(name, value = null, config = {}) {
    if (config.options === undefined)
      config.options = [];
    if (!Array.isArray(config.options)) {
      const error = new Error(
        'Expected config.options to be an Array.' +
        `\nBase: ${config.__base__}` +
        `\nTable: ${config.__table__}` +
        `\nField: ${name}` +
        `\nStrict: ${config.strict === true ? 'true' : 'false'}` + (config.options === undefined ? '' :
          `\nReceived: ${config.options}` +
          `\nType: ${Array.isArray(config.options) ? 'array' : typeof config.options}`
        )
      );
      error.name = 'UninitializedFieldError';
      throw error;
    }
    super(name, value, config);
    this._type = 'Single select';
  }

  get value() {
    if (super.value.length > 1)
      super.value = [super.value[0]];
    const value = super.value[0];
    if (value === undefined)
      return null;
    return value;
  }

  set value(value = null) {
    if (value === null)
      return super.value = null;
    if (!Array.isArray(this.options))
      return this._error('Expected config.options to be an Array.', this.options);
    if (typeof value !== 'string')
      return this._error('Expected value to be a String!', value);
    super.value = [value];
  }

  deselectOption(option) {
    if (this.optionIsSelected(option))
      this.value = null;
  }

  optionIsSelected(option) {
    return option === this.value;
  }

  selectOption(option) {
    if (!this.optionIsSelected(option))
      this.value = option;
  }
}

module.exports = SingleSelect;
