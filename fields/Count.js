const NumberField = require('./NumberField');
const LinkToAnotherRecord = require ('./LinkToAnotherRecord');


/* Count
 * Count the number of linked Records.
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
class Count extends NumberField {
  constructor(name, value, config = {}) {
    if (typeof config.field !== 'string') {
      const error = new Error(
        `'field' must be defined in the config for Field '${name}'. ` +
        `Received: ${config.field}`
      );
      error.name = 'UninitializedFieldError';
      throw error;
    }
    config.format = 'Integer';
    config.allowNegative = false;
    config.precision = 0;
    super(name, value, config);
    this._type = 'Count';
  }

  /* get changed
   * Return: <Boolean>
   *   A Boolean representing whether or not this field has changed from its original value.
   *   This function is used by the API.
   */
  get _changed() {
    return false;
  }

  /* get isLinked
   * Return: <Boolean>
   *   A Boolean representing whether or not this field has been properly linked to a LinkToAnotherRecord field.
   */
  get isLinked() {
    return this.link instanceof LinkToAnotherRecord;
  }

  /* get isLoaded
   * Return: <Boolean>
   *   A boolean representing whether or not the linked field has had it's records loaded in. Will return false if this field
   *   is not linked or if the query that this field was apart of had setupLinks set to false.
   */
  get isLoaded() {
    if (!this.isLinked)
      return false;
    return this.link.isLoaded;
  }

  /* get link
   * Return: <LinkToAnotherRecord>
   *   The field defined in the config (must be a field located on the same table as this field).
   */
  get link() {
    if (typeof this.config.field !== 'string')
      return this._error("Link cannot be retreived when 'field' is not defined in the config.", { field: this.config.field })
    if (this._isRecord(this.record)) {
      const field = this.record.fget(this.config.field);
      if (field instanceof LinkToAnotherRecord)
        return field;
      return this._error('The field defined in the config should be a LinkToAnotherRecordField.', field);
    }
  }

  /* get value
   * Return: <Integer>
   *   The number of Records that the link contains.
   */
  get value() {
    if (!this.isLinked)
      return super.value || 0;
    const link = this.link;
    if (link.isMulti) // if the field is multi then it'll always return an array even if the field is empty.
      return link.value.length;
    // Casts a boolean to an integer. If the field is empty (undefined, null, empty string (non-empty string should be a record id), or NaN)
    // this will return 0. Otherwise it'll return 1.
    return ~~(link.value !== undefined && link.value !== null && link.value !== '' && !(typeof link.value === 'number' && isNaN(link.value)));
  }

  /* set _changed
   * This function cannot be used.
   */
  set _changed(_) {
    return;
  }

  /* set isLinked
   * This function cannot be used.
   */
  set isLinked(_) {
    return;
  }

  /* set isLoaded
   * This function cannot be used.
   */
  set isLoaded(_) {
    return;
  }

  /* set link
   * This function cannot be used.
   */
  set link(_) {
    return;
  }

  /* set value
   * This field extends NumberField and sets itself to an Integer.
   * It calls super.value and its behavior will be that of a NumberField.
   * set value is only used to initialize the field and has no real purpose
   * as Count fields cannot be explicitly changed. The API automatically updates
   * this field as long as the field it relies on was defined in the table definition.
   */
  set value(value) {
    super.value = value;
  }
}

module.exports = Count;

