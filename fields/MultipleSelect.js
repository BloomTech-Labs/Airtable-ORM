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

  /* get options
   * Return:
   *   An Array of Strings. The options that were defined in the config.
   */
  get options() {
    return [...this.config.options];
  }

  /* get value
   * Return:
   *   An immutable Array of the selected options.
   */
  get value() {
    if(!Array.isArray(this._value))
      this._value = [];
    return this._deepFreezeValue(this._value);
  }

  /* set options
   * This function cannot be used.
   */
  set options(_){
    return;
  }

  /* set value
   * Parameters:
   *   value: <Array>
   *     An Array of options defined in the config. Selecting an option that does not exist
   *     in the config will throw an error.
   */
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

  /* delectOption(...selections)
   * Parameters:
   *   ...selections: <String>
   *     The options to deselect.
   */
  deselectOption(...selections) {
    const value = [];
    this.value.forEach((option) => {
      if (selections.indexOf(option) < 0)
        value.push(option);
    });
    this.value = value;
  }

  /* optionIsSelected(option)
   * Parameters:
   *   option: <String>
   *     The options in question.
   * Return:
   *   A Boolean representing whether or not this option has been selected.
   */
  optionIsSelected(option) {
    return this.value.indexOf(option) >= 0;
  }

  /* selectOption(...selections)
   * Parameters:
   *   ...selections: <String>
   *     The options to select.
   */
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
