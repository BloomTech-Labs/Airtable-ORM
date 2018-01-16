const Field = require('./Field');

/* Attachment
 * Attachments allow you to add images, documents, or other files which can then be viewed or downloaded.
 *
 * Parameters:
 *   name: <String>
 *   value: <Array>
 *     Should be an Array of key-value Objects representing an attachment
 *
 * Note that you may only remove attachments. They cannot be added and
 * data within an attachment Object cannot be changed. Adding attachments
 * (even if they are valid and pulled from another record) will throw a
 * 422 Error when the Record fails to save.
 */
class Attachment extends Field {
  constructor(name, value = null, config = {}) {
    if (config.mutable !== true || config.__strict__ === true)
      config.mutable = false;
    if (value === null)
      value = [];
    super(name, value, config);
    this._originalValue_ = JSON.parse(JSON.stringify(value));
    this.type = 'Attachment';
  }

  /* get value
   * Return: <Array>
   *   If field is empty, an empty array.
   *   The value returned from this function will be immutable.
   */
  get value() {
    if (this._value === undefined || this._value === null)
      this._value = [];
    if (this.config.mutable !== true)
      return this._deepFreezeValue(this._value);
    return this._value;
  }

  /* set value
   * Parameters:
   *   value: <Array>
   *     default: null
   *     undefined or null will be set to an empty Array.
   */
  set value(value = null) {
    if (value === null || (Array.isArray(value) && value.length === 0))
      return this._value = value;
    const checkValue = () => {
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++)
          if (typeof value[i] !== 'object' || Array.isArray(value[i]))
            return false;
        return true;
      }
      return false;
    };
    if (checkValue()) {
      if (this.config.mutable !== true)
        value = this._deepFreezeValue(value);
      this._value = value;
    } else {
      this._error('value must be an array of key-value objects.', value);
    }
  }
}

module.exports = Attachment;
