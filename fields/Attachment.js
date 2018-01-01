const Field = require('./Field');

/* Attachment
 * Attachments allow you to add images, documents, or other files which can then be viewed or downloaded.
 *
 * Parameters:
 *   name: <String>
 *   [value: <Array>]
 *     Should be an Array of key-value Objects representing an attachment
 *   [config: {
 *     mutable: <Boolean>
 *       default: false
 *       Defines whether or not the attachments array can be modified.
 *       Note that you may only remove attachments. They cannot be added and
 *       data within an attachment Object cannot be changed. Adding attachments
 *       will throw a 422 Error when the Record fails to save.
 *   }]
 */
class Attachment extends Field {
  constructor(name, value, config = {}) {
    if (config.mutable !== true)
      config.mutable = false;
    if (value === undefined || value === null)
      value = [];
    super(name, value, config);
    this._originalValue_ = JSON.parse(JSON.stringify(value));
    this.type = 'Attachment';
  }

  get value() {
    if (this._value === undefined || this._value === null)
      this._value = [];
    return this._value;
  }

  set value(value) {
    if (value === undefined || value === null || (Array.isArray(value) && value.length === 0))
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
      const makeImmutable = (object) => {
        Object.freeze(object);
        Object.entries(object).forEach(([key, value]) => {
          if (typeof key === 'object')
            makeImmutable(key);
          if (typeof value === 'object')
            makeImmutable(value);
        })
      };
      if (this.config.mutable !== true)
        makeImmutable(value);
      this._value = value;
    } else {
      throw new Error(`AttachmentError: value must be a array of key-value objects. Recieved '${JSON.stringify(value)}' of type '${(() => {
        let types = '';
        if (typeof value === 'object') {
          if (Array.isArray(value)) {
            types += '[';
            Object.values(value).forEach((obj) => {
              types += Array.isArray(obj) ? '<Array>, ' : `<${(typeof obj)[0].toUpperCase() + (typeof(obj)).substring(1)}>, `;
            });
            if (types === '[')
              return '[]';
            else
              return types.substring(0, types.length - 2) + ']'
          }
        }
        return typeof value;
      })()}.'`);
    }
  }
}

module.exports = Attachment;
