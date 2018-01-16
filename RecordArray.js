const Record = require('./Record');

class RecordArray extends Array {
  constructor(table, offset, parameters, setUpLinks, ...args) {
    super(...args);
    this._table = table;
    this._offset = offset;
    this._parameters = parameters;
    this._setUpLinks = setUpLinks;
  }

  get hasNextPage() {
    return this._offset !== undefined;
  }

  set hasNextPage(doesNothing) {
    return;
  }

  nextPage() {
    if (this.hasNextPage)
      return new Promise((resolve, reject) => {
        this._parameters.offset = this._offset;
        console.log('getting next page')
        this._table.query(this._parameters, this._setUpLinks)
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

  saveAll(deepSave = true) {
    this.forEach(record => record instanceof Record ? record.save(deepSave) : undefined);
  }

  stringify(replacer, space) {
    return JSON.stringify(this.map((item) => item instanceof Record ? JSON.parse(item.stringify()) : item), replacer, space);
  }
}

module.exports = RecordArray;
