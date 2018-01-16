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
 *      multi: <Boolean>
 *        default: false
 *   }]
 */
class Collaborator extends Field {
  constructor(name, value, config = {}) {
    if ((value === undefined || value === null) && config.multi === true)
      value = [];
    super(name, value, config);
    this._originalValue = value === undefined ? undefined : JSON.parse(JSON.stringify(value));
    this.type = 'Collaborator';
  }

  /* get isMulti
   * Return:
   *   A Boolean representing whether or not this field can accept an Array of collaborators.
   */
  get isMulti() {
    return this.config.multi || false;
  }

  /* get value
   * Return:
   *   If the field isMulti, this will return an Array of collaborators, or an empty Array.
   *   Otherwise, the field will return a collaborator or null.
   *   Example collaborator:
   *     {
   *       id: <String> Airtable User ID
   *       email: <String> User's email
   *       name: <String> User's full name
   *     }
   */
  get value() {
    if ((this._value === undefined || this._value === null) && this.isMulti)
      this._value = [];
    return this._deepFreezeValue(this._value || null);
  }

  set isMulti(value) {
    this._warn(
      'You cannot define whether or not this Field is multi through this API. ' +
      'It can only be done through the Airtable website.'
    );
  }

  /* set value
   * Parameters:
   *   value: <Array>/<Object>
   *   If the field isMulti, this will return an Array of collaborators, or an empty Array.
   *   Otherwise, the field will return a collaborator or null.
   *   Example collaborator:
   *     {
   *       id: <String> Airtable User ID
   *       email: <String> User's email
   *       name: <String> User's full name
   *     }
   */
  set value(value) {
    if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
      if (this.isMulti)
        return this._value = this._deepFreezeValue([]);
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
      this._value = this._deepFreezeValue(value);
    } else {
      this._error(`'value' must be a array of key-value objects.`, value);
    }
  }
}

module.exports = Collaborator;
