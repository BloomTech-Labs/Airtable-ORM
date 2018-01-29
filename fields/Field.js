/* Field
 * This Object should not be used. It is only meant to be a base for other Field classes.
 * Parameters:
 *   name: <String>
 *   value: <Anything>
 *   [config: <Object>]
 */
class Field {
  constructor(name, value, config = {}) {
    if (typeof name !== 'string') {
      const error = new Error(
        `The 'name' of a Field was not set to a String. ` +
        `Received: ${name}`
      );
      error.name = 'UninitializedFieldError';
      throw error;
    }
    if (config.strict !== true)
      config.strict = false;
    this.name = name;
    this.config = config;
    if (value !== undefined)
      this.value = value;
    this._originalValue = value;
  }

  /* get _changed
   * Return:
   *   A boolean representing whether or not this field has changed from its original value.
   *   This function is used by the API.
   */
  get _changed() {
    if (Array.isArray(this._originalValue) && Array.isArray(this.value))
      return JSON.stringify([...this._originalValue].sort()) !== JSON.stringify([...this._saveValue].sort());
    return this._originalValue !== this._saveValue && JSON.stringify(this._originalValue) !== JSON.stringify(this.value);
  }

  /* get _originalValue
   * Return:
   *   The original value that was passed into this Field or the value that was in this Field after a
   *   successful save operation. This function is used to determine if a save request should be sent
   *   for this Field.
   */
  get _originalValue() {
    return this._originalValue_;
  }

  /* get _saveValue
   * Return:
   *   This function is used by the API to convert the value stored in this field over to a value
   *   that Airtable.com will accept (if it needs to convert anything).
   */
  get _saveValue() {
    if (this.config.strict === true)
      return this.value;

    if (this.value === undefined || this.value === null)
      return null;

    if (this._originalValue === undefined || typeof this.value === typeof this._originalValue)
      return this.value; // doesn't need to be changed
    if (this._originalValue !== undefined) {
      if (this.value === undefined || this.value === null || (typeof this.value === 'number' && isNaN(this.value)))
        return null; // clears the field if they set something to 'undefined', 'null', or 'NaN'
    }
    if (typeof this._originalValue === 'string')
      return `${this.value}`; // converts the value to a string
    if (typeof this._originalValue === 'boolean')
      return !!this.value; // converts the value to a boolean
    if (typeof this._originalValue === 'number')
      return Number(this.value); // converts the value to a number
    if (Array.isArray(this._originalValue))
      return [].concat(this.value); // converts the value to an array
    // if something else needs to be done to change this to the correct value
    // then the class extending Field will need to override get _saveValue()
    return this.value;
  }

  /* get config
   * Return:
   *   A key-value Object of the config for this Field defined in the Table Definition.
   */
  get config() {
    return this._config || {};
  }

  /* get isStrict
   * Return:
   *   Returns a Boolean representing whether or not the Field is in Strict mode.
   */
  get isStrict() {
    return this.config.__strict__ === true;
  }

  /* get name
   * Return:
   *   A String of the name of this Field as it is on Airtable.com.
   */
  get name() {
    return this._name;
  }

  /* get record
   * Return:
   *   The Record Object that this Field is a part of.
   */
  get record() {
    return this.config.__record__;
  }

  /* get type
   * Return:
   *   A String representing the type of this Field as it is on Airtable.com.
   *   (ie. LinkToAnotherRecord.type === 'Link to another record')
   */
  get type() {
    return this._type;
  }

  /* get value
   * Return:
   *   The value of the Field. This will likely be whatever Object the Field extending this returns as most
   *   Field classes override this.
   */
  get value() {
    return this._value === 0 || this._value === false ? this._value : this._value || null;
  }

  /* set _changed
   * This function cannot be used.
   */
  set _changed(_) {
    return;
  }

  /* set _originalValue
   * Parameters:
   *   value: <Anything>
   * This function should not be used as it only exists for the API to use.
   * It sets the initial original value of the field and is used to update it
   * whenever a save operation is successful.
   */
  set _originalValue(value) {
    this._originalValue_ = value;
  }

  /* set _saveValue
   * This function cannot be used.
   */
  set _saveValue(_) {
    return;
  }

  /* get config
   * Parameters:
   *   config: <Object>
   * Sets the config for the field. It cannot be changed once set.
   */
  set config(config) {
    if (this._config !== undefined)
      return this._error('config can not be changed!');
    if (typeof config !== 'object' || Array.isArray(config))
      return this._error('config should be key-value Object.', config);
    this._config = config;
  }

  /* set isStrict
   * This function cannot be used.
   */
  set isStrict(_) {
    return;
  }

  /* set name
   * Parameters:
   *   name: <String>
   * Sets the name of this Field.
   */
  set name(name) {
    if (this._checkName(name))
      this._name = name;
  }

  /* set record
   * This function cannot be used.
   */
  set record(_) {
    return;
  }

  /* set type
   * Parameters:
   *   type: <String>
   * Sets the type of this Field. Should be the same format as it is on Airtable.com
   */
  set type(type) {
    if (this.type !== undefined)
      return this._error('type can not be changed!', type);
    this._type = type;
  }

  /* set value
   * Parameters:
   *   value:
   *     The value of the Field. This will likely need to be whatever the class extending this requires
   *     as most Field classes override this.
   */
  set value(value) {
    this._value = value;
  }

  /* _checkName(name)
   * Parameters:
   *   name: <String>
   * Used to verify that the name is a String with a length of at least 1 character.
   */
  _checkName(name) {
    if (typeof name !== 'string' || name.length < 1)
      return this._error('name must be a string with a minimum length of 1 character.', name);
    return true;
  }

  /* copy()
   * Return:
   *   Returns a Field object which has been initialized as the same type of Field as the original.
   *   It has the same name, value, config, and _originalValue. This does not copy Objects that are set
   *   to this Field's value. (ie. If you copy a field and it has a value that is an Array, any modifications
   *   to that array will show up on both fields).
   */
  copy() {
    const copy = new this.constructor(this.name, this.value, this.config);
    copy._originalValue_ = this._originalValue;
    return copy;
  }

  /* isPrimary()
   * Return:
   *   A Boolean representing whether or not this Field is the primary Field on the Record.
   */
  isPrimary() {
    return this.config.primary === true;
  }

  /* toString(includeName)
   * Parameters:
   *   includeName: <Boolean>
   *     Whether or not to include the name of the Field in the String.
   * Return:
   *   A String of the field's name and value unless includeName is set to false.
   *     "name: value"
   */
  toString(includeName = true) {
    return `${includeName === true ? `${this.name}: ` : ''}${this.value.toString()}`;
  }

  /* _isRecord(object)
   * Return:
   *   A Boolean representing whether or not the Object in question is a Record Object.
   */
  _isRecord(object) {
    return typeof object === 'object' && object !== null && object.constructor.name === 'Record';
  }

  /* _deepFreezeValue(value)
   * Parameters:
   *   value: <Boolean>
   *     This will make a copy* of the value and freeze it as well as any Objects within it,
   *     any Objects within those, and so on.
   * Return:
   *   A frozen copy* of the original value.
   * *Does not create new instances of Record or Field Objects.
   */
  _deepFreezeValue(value) {
    const cache = {};
    const handleValue = (value) => {
      if (cache[value] === true)
        return value;
      cache[value] = true;
      // Object.isFrozen(undefined/null/NaN) all return true but I left the check here to be safe.
      if (value === undefined || value === null || (typeof value === 'number' && isNaN(value)))
        return value;
      if (Object.isFrozen(value))
        return value;
      if (this._isRecord(value))
        return value;
      if (value instanceof Field)
        return value;
      if (Array.isArray(value))
        return Object.freeze(value.map(value => handleValue(value)));
      if (typeof value === 'object')
        return Object.freeze(Object.entries(value).reduce((obj, [key, value]) => obj[key] = handleValue(value), {}));
      return Object.freeze(JSON.parse(JSON.stringify(value)));
    };
    return handleValue(value);
  }

  /* _error(message, received, forceThrow)
   * Parameters:
   *   message: <String>
   *     The error message.
   *   received: <Anything>
   *     The value that was received that is resulting in an error being thrown.
   *   forceThrow: <Boolean>
   *     A Boolean representing whether or not to ignore the config.__ignoreFieldErrors__
   * This will either throw an error or print an error depending on whether or not
   * config.__ignoreFieldErrors__ is set to true and whether or not forceThrow is set to true.
   */
  _error(message, received, forceThrow = false) {
    const type = this.type === undefined ? 'UninitializedField' : this.constructor.name;
    const base = this.record ? this.record.table ? this.record.table.base : undefined : undefined;
    const table = this.record ? this.record.table ? this.record.table.name : undefined : undefined;
    const record = this.record ? this.record.id : undefined;
    let className;
    if (received !== undefined && received !== null && !(typeof received === 'number' && isNaN(received)))
      className = received.constructor.name;
    let rPrint;
    if (this._isRecord(received))
      rPrint = received.stringify(null, 2);
    else if (received instanceof Field)
      rPrint = received.toString(false);
    else
      rPrint = JSON.stringify(received, null, 2);
    const error = new Error(
      `${message}` +
      '\n=====FIELD INFO=====' +
      `\nBase: ${base}` +
      `\nTable: ${table}` +
      `\nRecord: ${record}` +
      `\nField: ${this.name}` +
      `\nStrict: ${this.config.strict === true ? 'true' : 'false'}` +
      `\nReceived: ${rPrint}` +
      `\nType: ${Array.isArray(received) ? 'array' : typeof received}` +
      (className !== undefined ? `\nClass: ${className}` : '') +
      '\n=====FIELD INFO====='
    );
    error.name = `${type}Error`;
    if (this.type !== undefined && (forceThrow === true || this.config.__ignoreFieldErrors__ !== true))
      throw error;
    console.error(`${error.stack}`);
    if (this.type === undefined) {
      console.error(
        'Fields which fail to initialize will cause a lot of problems later on.\n' +
        `Because the field failed to initialize, there is a good possibility that data which wasn't allowed with your field config came in from Airtable.\n` +
        'This can happen if you have a NumberField set to strict with a precision of 2 and the value 12.888 is saved on Airtable.\nThe Airtable website ' +
        'will make that look like 12.89 and you can only interract with it as 12.89 on the website, however their REST API will send 12.888.\n' +
        'To prevent failures throughout the API, exiting with status code 2.'
      );
      process.exit(2);
    }
  }

  /* _warn(message, received)
   * Parameters:
   *   message: <String>
   *     The error message.
   *   received: <Anything>
   *     The value that was received that is resulting in an error being thrown.
   * This will print a warning to the console.
   */
  _warn(message, received) {
    const type = this.type === undefined ? 'UninitializedField' : this.constructor.name;
    const base = this.record ? this.record.table ? this.record.table.base : undefined : undefined;
    const table = this.record ? this.record.table ? this.record.table.name : undefined : undefined;
    const record = this.record ? this.record.id : undefined;
    let className;
    if (received !== undefined && received !== null && !(typeof received === 'number' && isNaN(received)))
      className = received.constructor.name;
    let rPrint;
    if (this._isRecord(received))
      rPrint = received.stringify(null, 2);
    else if (received instanceof Field)
      rPrint = received.toString(false);
    else
      rPrint = JSON.stringify(received, null, 2);
    const warning = (
      `${type}Warning: ${message}` +
      '\n=====FIELD INFO=====' +
      `\nBase: ${base}` +
      `\nTable: ${table}` +
      `\nRecord: ${record}` +
      `\nField: ${this.name}` +
      `\nStrict: ${this.config.strict === true ? 'true' : 'false'}` +
      `\nReceived: ${rPrint}` +
      `\nType: ${Array.isArray(received) ? 'array' : typeof received}` +
      (className !== undefined ? `\nClass: ${className}` : '') +
      '\n=====FIELD INFO====='
    );
    console.warn(warning);
  }
}

module.exports = Field;
