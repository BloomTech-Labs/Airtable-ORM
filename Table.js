const axios = require('axios');
const Request = require('./Request');
const Record = require('./Record');
const UnknownField = require('./fields/UnknownField');

class Table {
  constructor(airtable, base, name, fields = {}) {
    this._airtable = airtable;
    this._defaultFields = {};
    this.base = base;
    this.fields = fields;
    this.name = name;
  }

  get _airtable() {
    return this._airtable_;
  }

  get _defaultFields() {
    return this._defaultFields_;
  }

  get base() {
    return this._base;
  }

  get fields() {
    return this._fields;
  }

  get name() {
    return this._name;
  }

  set _airtable(airtable) {
    if (this._airtable !== undefined)
      throw new Error('TableError: _airtable can not be changed!');
    this._airtable_ = airtable;
  }

  set _defaultFields(defaultFields) {
    if (this._defaultFields !== undefined)
      throw new Error('TableError: _defaultFields can not be changed!');
    this._defaultFields_ = defaultFields;
  }

  set base(base) {
    if (this._base !== undefined)
      throw new Error('TableError: base can not be changed!');
    this._base = base;
  }

  set fields(fields) {
    if (this.fields !== undefined)
      throw new Error('TableError: fields can not be changed!');
    if (typeof fields !== 'object' || Array.isArray(fields))
      throw new Error('Fields must be a key-value Object: Received a(n) ' + Array.isArray(fields) ? 'array' : typeof fields + '.');
    Object.entries(fields).forEach(([key, value]) => {
      value.name = value.name || key;
      fields[key] = value;
      this._defaultFields[key] = new value.type(value.name, undefined, value);
    });
    this._fields = fields;
  }

  set name(name) {
    if (this.name !== undefined)
      throw new Error('TableError: name can not be changed!');
    if (this._checkName(name))
      this._name = name;
  }

  _checkName(name) {
    if (typeof name !== 'string' || name.length < 1)
      throw new Error('TableError: name must be a string with a minimum length of 1 character.');
    return true;
  }

  _getFieldEntry(name) {
    if (this.fields === undefined)
      return [];
    const entries = Object.entries(this.fields);
    for (let i = 0; i < entries.length; i++)
      if (entries[i][1].name === name)
        return entries[i];
    return [];
  }

  createField(name, value=null) {
    if (Object.keys(this.fields).indexOf(name) >= 0)
      throw new Error(`TableError: Field '${name}' already exists!`);
  }

  query(parameters = {}) {
    return new Promise((resolve, reject) => {
      const { fields, filterByFormula, maxRecords, pageSize = 100, sort, view = 'Grid view' } = parameters;
      const request = new Request(
        Request.types.get,
        {
          base: this.base,
          tableName: this.name,
          parameters: {
            fields,
            filterByFormula,
            maxRecords,
            pageSize,
            sort,
            view
          },
        },
        (res) => {
          console.log('success');
          const records = [];
          res.data.records.forEach((record) => {
            const fields = {...this._defaultFields};
            Object.entries(record.fields).forEach(([name, value]) => {
              const [key, settings] = this._getFieldEntry(name);
              const args = [name, value, settings];
              const f = settings === undefined ? new UnknownField(...args) : new settings.type(...args);
              fields[key] = f;
            })
            try {
              records.push(new Record(this, record.id, record.createdTime, fields));
            } catch (error) {
              reject(error);
            }
          });
          resolve(records);
        },
        (...args) => reject(...args)
      );
      this._airtable.sendRequest(request);
    });
  }
}

module.exports = Table;
