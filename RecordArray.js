const Record = require('./Record');

/* RecordArray
 * Parameters:
 *   table: <Table>
 *     The Table Object that the Records on this Array exist on.
 *   offset: <String>
 *     The offset from Airtable.com to go to the next page of Records.
 *     (required for going to the next page of Records).
 *   parameters: <Object>
 *     The parameters used in the initial request (required for going
 *     to the next page of Records).
 *   setupLinks: <Boolean>
 *     Whether or not to setup LinkToAnotherRecord Fields.
 *   ...args: <Anything>
 *     This class extends Array and the ...args parameter is passed
 *     into super().
 * This Object is used to store Record Object and allows you to read
 * through Records page by page.
 */
class RecordArray extends Array {
  constructor(table, offset, parameters, setupLinks, ...args) {
    super(...args);
    this._table = table;
    this._offset = offset;
    this._history = [];
    if (typeof offset === 'string' && offset.length > 1)
      this._history.push(offset);
    this._parameters = parameters;
    this._setupLinks = setupLinks;
  }

  /* get hasNextPage
   * Return:
   *   A Boolean representing whether or not there is another page of
   *   Records that can be retrieved.
   */
  get hasNextPage() {
    return this._offset !== undefined;
  }

  /* get hasPreviousPage
   * Return:
   *   A Boolean representing whether or not there is known previous
   *   page of Records that can be retrieved.
   * Note that you can only go back a page if you have gone forward first.
   * This Object will keep track of references to pages, but Airtable.com
   * does not actually send that information through so you can only ever
   * go back as far as you started. If you're using the API to generate
   * RecordArrays for you then this shouldn't be a problem as you should
   * always start on the first page.
   */
  get hasPreviousPage() {
    return this._getPreviousOffset() !== undefined;
  }

  /* set hasNextPage
   * This function cannot be used.
   */
  set hasNextPage(_) {
    return;
  }

  /* set hasPreviousPage
   * This function cannot be used.
   */
  set hasPreviousPage(_) {
    return;
  }

  /* _getPreviousOffset()
   * Return:
   *   Returns a String of the offset for the previous page, or returns null
   *   if the next page is the first known page, or returns undefined
   *   if there is not another known previous page.
   */
  _getPreviousOffset() {
    // 2 is subtracted from the index because the current offset is the
    // offset for the next page. Subtract 1 for current page, subtract 1
    // more for previous page. I set it to null say that there is a previous
    // page, the first page.
    let previous = this._history[this._history.indexOf(this._offset) - 2];
    if (previous === undefined) {
      if (this._offset === this._history[1] && this._offset !== undefined)
        previous = null;
      if (this._offset === undefined) {
        previous = this._history.length > 1 ? this._history[this._history.length - 2] : undefined;
        previous = this._history.length === 1 ? null : undefined;
      }
    }
    return previous;
  }

  /* nextPage()
   * Return:
   *   Returns a Promise which will resolve this Object if it was able to request a next page.
   *   If there isn't a next page then it will resolve undefined.
   *   When a request is successful, this Object will dump all the Records it has stored
   *   and store the new Records. It does not resolve a new RecordArray, it resolves itself.
   *   It will reject any errors it gets.
   */
  nextPage() {
    if (this.hasNextPage)
      return new Promise((resolve, reject) => {
        this._parameters.offset = this._offset;
        this._table.query(this._parameters, this._setupLinks)
          .then((records) => {
            this._offset = undefined;
            this.length = 0;
            if (records instanceof RecordArray) {
              this._offset = records._offset;
              if (typeof this._offset === 'string' && this._offset.length > 1 && this._history.indexOf(this._offset) < 0)
                this._history.push(this._offset);
              this.push(...records);
            }
            resolve(this);
          })
          .catch(reject);
      });
    return new Promise(resolve => resolve(undefined));
  }

  /* previousPage()
   * Return:
   *   Returns a Promise which will resolve this Object if it was able to request a previous page.
   *   If there isn't a previous page then it will resolve undefined.
   *   When a request is successful, this Object will dump all the Records it has stored
   *   and store the new Records. It does not resolve a new RecordArray, it resolves itself.
   *   It will reject any errors it gets.
   */
  previousPage() {
    if (this.hasPreviousPage)
      return new Promise((resolve, reject) => {
        this._parameters.offset = this._getPreviousOffset();
        this._table.query(this._parameters, this._setupLinks)
          .then((records) => {
            this._offset = undefined;
            this.length = 0;
            if (records instanceof RecordArray) {
              this._offset = records._offset;
              this.push(...records);
            }
            resolve(this);
          })
          .catch(reject);
      });
    return new Promise(resolve => resolve(undefined));
  }

  /* saveAll(deepSave)
   * Parameters:
   *   deepSave: <Boolean>
   *     A Boolean representing whether or not to go into any LinkToAnotherRecord Fields
   *     and save those linked Records as well.
   * Return:
   *   Returns a Promise which resolves this Object after it has gone through
   *   all the Records it has stored and called a save operation on them.
   *   Will reject any errors that happen during a save operation.
   */
  saveAll(deepSave = true) {
    return new Promise((resolve, reject) => {
      const promises = [];
      this.forEach(record => record instanceof Record ? promises.push(record.save(deepSave)) : undefined);
      Promise.all(promises).then(() => resolve(this)).catch(reject);
    });
  }

  /* stringify(replacer, space)
   * Parameters:
   *   repalcer: <Function> <Array>
   *     A function that alters the behavior of the stringification
   *     process, or an array of String and Number objects that serve
   *     as a whitelist for selecting/filtering the properties of the
   *     value object to be included in the JSON string. If this value
   *     is null or not provided, all properties of the object are included
   *     in the resulting JSON string.
   *   spacer: <String> <Number>
   *     A String or Number object that's used to insert white space into the
   *     output JSON string for readability purposes. If this is a Number, it
   *     indicates the number of space characters to use as white space; this
   *     number is capped at 10 (if it is greater, the value is just 10). Values
   *     less than 1 indicate that no space should be used. If this is a String,
   *     the string (or the first 10 characters of the string, if it's longer
   *     than that) is used as white space. If this parameter is not provided (or
   *     is null), no white space is used.
   * Return:
   *   A String of all the Fields in a mostly JSON format. Goes through each record and calls
   *   Record.stringify
   */
  stringify(replacer, space) {
    return JSON.stringify(this.map((item) => item instanceof Record ? JSON.parse(item.stringify()) : item), replacer, space);
  }
}

module.exports = RecordArray;
