const Field = require('./Field');

/* Barcode
 * Use the Airtable iOS or Android app to scan barcodes.
 * Parameters:
 *   name: <String>
 *   value: {
 *     text: <String>
 *       default: ''
 *       Will attempt to convert passed in values to Strings.
 *       Clear this field by setting the text/value to null or undefined.
 *     type: <String>
 *       default: 'code128'
 *       The type of barcode you are using.
 *   }
 * Strict:
 *   undefined and null barcode text will still be set to an empty String, but anything else
 *   that is not a String will throw an error.
 */
class Barcode extends Field {
  constructor(name, { text = '', type = 'code128', ...rest } = {}, config) {
    if (typeof text !== 'string' || typeof type !== 'string') {
      const error = new Error(
        `Initalized with bad values for Field '${name}'. 'text' and 'type' must both be strings. ` +
        `Received: ${{ text, type }}`
      );
      error.name = 'UninitializedFieldError';
      throw error;
    }
    super(name, { text, type, ...rest }, config);
    this.type = 'Barcode';
  }

  /* get changed
   * Return: <Boolean>
   *   A boolean representing whether or not this field has changed from its original value.
   *   This function is used by the API.
   */
  get _changed() {
    if ((this._value === undefined || this._saveValue === null) && (this._originalValue === undefined || this._originalValue === null))
      return false;
    if (this.value.text === this._originalValue.text && this.value.type === this._originalValue.type)
      return false;
    return true;
  }

  /* get _saveValue
   * Return:
   *   This function is used by the API to convert the value stored in this field over to a value
   *   that Airtable.com will accept (if it needs to convert anything).
   */
  get _saveValue() {
    if (this.value === null || (this._value === undefined && this._originalValue !== undefined))
      return null;
    let { text, type } = this.value;
    if (text === undefined || text === null)
      return null;
    return { text, type };
  }

  /* get barcodeText
   * Return: <String>
   *   A String of the text from the barcode.
   *   An empty string if the text is empty.
   */
  get barcodeText() {
    if (this.value === null)
      this._value = this.defaultBarcode();
    return this._value.text || '';
  }

  /* get barcodeType
   * Return: <String>
   *   A String of the type from the barcode.
   *   The default type that Airtable seems to convert
   *   everything to is 'code128'. This function will
   *   likely return that.
   */
  get barcodeType() {
    if (this.value === null)
      this._value = this.defaultBarcode();
    return this._value.type || '';
  }

  /* get value
   * Return: <Object>
   *   {
   *     text: <String>
   *       A String of the text from the barcode.
   *       An empty string if the text is empty.
   *     type: <String>
   *       A String of the type from the barcode.
   *       The default type that Airtable seems to convert
   *       everything to is 'code128'. It will likely be that.
   *   }
   */
  get value() {
    if (this._value === undefined || this._value === null) {
      this._value = this.defaultBarcode();
    } else {
      // catch any problems before a save request is called.
      this.barcodeText = this._value.text;
      this.barcodeType = this._value.type;
    }
    return this._value;
  }

  /* set _changed
   * This function cannot be used.
   */
  set _changed(_) {
    return;
  }

  /* set _saveValue
   * This function cannot be used.
   */
  set _saveValue(_) {
    return;
  }

  /* set barcodeText
   * Parameters:
   *   value: <String>
   *     default: null
   *     A String of the text for the barcode.
   *     undefined or null will be set to an empty String.
   */
  set barcodeText(value = null) {
    if (this._value === undefined || this._value === null)
      this._value = this.defaultBarcode();
    if (value === null) {
      this._value.text = '';
    } else {
      if (typeof value !== 'string' && this.isStrict)
        return this._error(`'value' must either be a string to set the text or a key-value object { text, type }.`, value);
      this.barcodeText = `${value}`;
    }
  }

  /* set barcodeText
   * Parameters:
   *   value: <String>
   *     default: null
   *     A String of the type for the barcode.
   *     undefined or null will be set to the type
   *     from this.defaultBarcode().
   */
  set barcodeType(value) {
    if (value === null)
      value = this.defaultBarcode().type;
    if (typeof value !== 'string') {
      return this._error(`'type' must be a string.`, value);
    } else {
      if (this._value === undefined || this._value === null)
        this._value = this.defaultBarcode();
      this._value.type = value;
    }
  }

  /* set value
   * Parameters:
   *   value: <String>
   *     A String of the text for the barcode.
   *     undefined or null will be set to an empty String.
   *   value: {
   *     text: <String>
   *       A String of the text for the barcode.
   *       undefined or null will be set to an empty String.
   *     type: <String>
   *       A String of the type for the barcode.
   *       undefined or null will be set to the type
   *       from this.defaultBarcode().
   *   }
   */
  set value(value = null) {
    if (value === null) {
      value = '';
      if (typeof this._value === 'object' && this._value !== null)
        return this._value.text = value;
      this._value = this.defaultBarcode();
      return this._value.text = value;
    }
    if (typeof value === 'object') {
      if (Array.isArray(value))
        return this._error(`'value' must either be a string to set the text or a key-value object { text, type }.`, value);
      const {text, type} = value;
      this.barcodeText = text;
      this.barcodeType = type;
    } else {
      if (typeof value !== 'string' && this.isStrict)
        return this._error(`'value' must either be a string to set the text or a key-value object { text, type }.`, value);
      this.barcodeText = `${value}`;
    }
  }

  /* defaultBarcode
   * Return: <Object>
   *   An empty barcode using the type ('code128') that
   *   Airtable seems to set everything to.
   */
  defaultBarcode() {
    return { text: '', type: 'code128' }
  }
}

module.exports = Barcode;

