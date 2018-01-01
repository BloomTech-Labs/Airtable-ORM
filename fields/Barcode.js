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
 */
class Barcode extends Field {
  constructor(name, { text = '', type = 'code128', ...rest } = {}, config) {
    if (typeof text !== 'string' || typeof type !== 'string')
      throw new Error(
        `BarcodeError: A Barcode field '${name}' was initalized with bad values. text and type must both be strings. ` +
        `Received: '{ text: ${text}, type: ${type} }' of types '{ text: ${typeof text}, type: ${typeof type} }'`
      );
    super(name, { text, type, ...rest }, config);
    this.type = 'Barcode';
  }

  get _changed() {
    if ((this._value === undefined || this._saveValue === null) && (this._originalValue === undefined || this._originalValue === null))
      return false;
    if (this.value.text === this._originalValue.text && this.value.type === this._originalValue.type)
      return false;
    return true;
  }

  get _saveValue() {
    if (this.value === null || (this._value === undefined && this._originalValue !== undefined))
      return null;
    let { text, type } = this.value;
    if (text === undefined || text === null)
      return null;
    return { text, type };
  }

  get barcodeText() {
    if (this.value === null)
      this._value = this.defaultBarcode();
    return this._value.text;
  }

  get barcodeType() {
    if (this.value === null)
      this._value = this.defaultBarcode();
    return this._value.type;
  }

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

  set _changed(value) {
    return;
  }

  set _saveValue(value) {
    return;
  }

  set barcodeText(value) {
    if (this._value === undefined || this._value === null)
      this._value = this.defaultBarcode();
    if (value === undefined || value === null)
      this._value.text = null;
    else
      this._value.text = `${value}`;
  }

  set barcodeType(value) {
    if (this._value === undefined || this._value === null)
      this._value = this.defaultBarcode();
    if (typeof value !== 'string')
      throw new Error(`BarcodeError: The type of a Barcode in Field '${this.name}' was not set to a String. Received: '${value}' of type ${typeof value}.`)
    else
      this._value.type = value;
  }

  set value(value) {
    if (value === undefined || value === null)
      return this._value = this.defaultBarcode();
    if (typeof value === 'object') {
      if (Array.isArray(value))
        throw new Error(`BarcodeError: value must either be a string to set the text or a key-value object { text, type }. Received an Array.`);
      const {text, type} = value;
      this.barcodeText = text;
      this.barcodeType = type;
    } else {
      this.barcodeText = value;
    }
  }

  defaultBarcode() {
    return { text: '', type: 'code128' }
  }
}

module.exports = Barcode;

