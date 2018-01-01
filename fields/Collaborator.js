const Field = require('./Field');

/* Collaborator
 * A collaborator field lets you add collaborators to your records. Collaborators can
 * optionally be notified when they're added by enabling that option through the
 * Airtable website.
 *
 * Parameters:
 *   name: <String>
 *   [value: <Object>] (config.multi: false)
 *     Should be a key-value Object representing an Airtable user.
 *   [value: <Array>] (config.multi: true)
 *     Should be an Array of key-value Objects representing an Airtable user.
 *     Example Object:
 *       {
 *         id: <String> Airtable User ID
 *         email: <String> User's email
 *         name: <String> User's full name
 *       }
 *     You only need to send an Object containing an Airtable User ID or `email` to add
 *     a collaborator. Airtable looks for an `id` and then looks at the `email` if an `id`
 *     is not present. Sending a bad `id` and good `email` will fail; sending a good `id`
 *     and bad `email` will succeed; sending only an `id` will succeed; sending only an
 *     `email` will succeed; sending only a `name` will fail. Airtable does not look
 *     at the `name`.
 *   [config: {
 *     mutable: <Boolean>
 *       default: false
 *       Defines whether or not the collaborator array (multi: true) can be modified.
 *       Data within a collaborator Object cannot be changed. Saving a collaborator
 *       which isn't part of the Base will throw a 422 error.
 *      multi: <Boolean>
 *        default: false
 *   }]
 */
class Collaborator extends Field {
  constructor(name, value, config = {}) {
    if (config.mutable !== true)
      config.mutable = false;
    if ((value === undefined || value === null) && config.multi === true)
      value = [];
    super(name, value, config);
    this._originalValue_ = value === undefined ? undefined : JSON.parse(JSON.stringify(value));
    this.type = 'Collaborator';
  }

   get isMulti() {
    return this.config.multi || false;
  }

  get value() {
    if ((this._value === undefined || this._value === null) && this.isMulti)
      this._value = [];
    return this._value;
  }

  set isMulti(value) {
    throw new Error(
      'CollaboratorError: You cannot define whether or not this Field is multi through this API. ' +
      'It can only be done through the Airtable website.'
    );
  }

  set value(value) {
    if (this.value !== undefined && this.config.mutable !== true) {
      console.warn(`CollaboratorError: `)
      return;
    }
    if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
      if (this.isMulti)
        return this.value.length = 0;
      return this._value = null;
    }
    const checkValue = () => {
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++)
          if (typeof value[i] !== 'object' || Array.isArray(value[i]))
            return false;
        return true;
      }
      return typeof value === 'object';
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
      throw new Error(`Collaborator: value must be a array of key-value objects. Recieved '${JSON.stringify(value)}' of type '${(() => {
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

module.exports = Collaborator;
