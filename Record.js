const Field = require('./fields/Field')
const LinkToAnotherRecord = require('./fields/LinkToAnotherRecord')
const UnknownField = require('./fields/UnknownField')
const Request = require('./Request');

class Record {
  constructor(table, id, createdTime, fields = {}) {
    this.createdTime = new Date(createdTime);
    this.id = id;
    this._configureBlacklist();
    this._cache_ = [];
    this.fields = fields;
    this.table = table;
  }

  /* _fields_
  *  Do not use this!
  */
  get _fields_() {
    return this.__fields__;
  }

  get createdTime() {
    return this._createdTime;
  }

  get fields() {
    return this._fields;
  }

  get id() {
    return this._id;
  }

  get primaryField() {
    const entries = Object.entries(this.fields);
    for (let i = 0; i < entries.length; i++) {
      const [key, field] = entries[i];
      if (field.isPrimary())
        return field.value;
    }
  }

  get table() {
    return this._table;
  }

  /* _fields_
  *  Do not use this!
  */
  set _fields_(fields) {
    this.__fields__ = this._copyFields(fields);
  }

  set createdTime(createdTime) {
    if (this.createdTime !== undefined)
      throw new Error('RecordError: createdTime cannot be changed!');
    this._createdTime = createdTime;
  }

  set fields(fields) {
    if (this.fields !== undefined && (!Array.isArray(fields) && fields.length !== 2))
      throw new Error('RecordError: fields cannot be changed!');
    if (Array.isArray(fields) && fields[0] === 'change fields')
      fields = fields[1];
    if (this._cache_ !== undefined)
      this._cache_.forEach((key) => {
        Object.defineProperty(this, key, {
          get: undefined,
          set: undefined,
          enumerable: true,
          configurable: true
        });
      });
    this._cache_ = Object.keys(fields);
    this._cache_.forEach((key) => {
      if (this._checkField(key))
        Object.defineProperty(this, key, {
          get: () => this.fields[key].value,
          set: (value) => this.fields[key].value = value,
          enumerable: true,
          configurable: true
        });
    });
    this._fields = fields;
    this._fields_ = fields;
  }

  set id(id) {
    if (this.id !== undefined)
      throw new Error('RecordError: id cannot be changed!');
    this._id = id;
  }

  set primaryField(value) {
    const entries = Object.entries(this.fields);
    for (let i = 0; i < entries.length; i++) {
      const [key, field] = entries[i];
      if (field.isPrimary())
        return field.value = value;
    }
  }

  set table(table) {
    if (this.table !== undefined)
      throw new Error('RecordError: table cannot be changed!');
    if (typeof table !== 'object' || table._airtable_ === undefined)
      throw new Error("RecordError: Hmm... It doesn't look like you passed in a Table Object.");
    this._table = table;
  }

  getField(name) {
    if (this.fields === undefined)
      return;
    const values = Object.values(this.fields);
    for (let i = 0; i < values.length; i++) {
      const field = values[i];
      if (field.name === name)
        return field;
    }
  }

  has(key) {
    return this.fields[key] !== undefined;
  }

  get(name) {
    const field = this.getField(name);
    if (field === undefined)
      return;
    return field.value;
  }

  put(name, value) {
    const field = this.getField(name);
    if (field === undefined)
      throw new Error(`TableError: Field '${name}' does not exist!`);
    field.value = value;
  }

  save() {
    return this.update();
  }

  update() {
    const changed = [];
    const newFields = [];
    Object.entries(this.fields).forEach(([key, field]) => {
      if (!(field instanceof Field)) {
        if (this._fields_[key] !== undefined)
          field = new this._fields_[key].constructor(field);
        else
          field = new UnknownField(key, field);
        this.fields[key] = field;
      }
      if (this._fields_[key] === undefined)
        newFields.push(key);
      else if (this._fields_[key].value !== field.value)
        changed.push(key);
    });
    if (changed.length > 0)
      console.log('Changed fields: ', JSON.stringify(changed, null, 2));
    if (newFields.length > 0)
      console.log('New fields: ', JSON.stringify(newFields, null, 2));
    return new Promise((resolve, reject) => {
      this.table._airtable.sendRequest(new Request(
        Request.types.patch,
        {
          base: this.table.base,
          tableName: this.table.name,
          appendID: this.id,
          data: {
            fields: changed.reduce((obj, item) => {
              obj[this.fields[item].name] = this.fields[item].value;
              return obj;
            }, {})
          }
        },
        (res) => {
          this.fields = ['change fields', this.fields];
          resolve(this);
        },
        (...args) => reject(...args)
      ));
    });
  }

  dangerouslyReplace() {

  }

  _checkField(key) {
    if (this._blacklist_.indexOf(key) >= 0) {
      throw new Error(`FieldError: Oops! Looks like you managed to pick the same name as an Object that's being used in the Record class. Please pick a name other than '${key}'.`)
    }
    return true;
  }

  _copyFields(fields) {
    const fieldsCopy = {};
    Object.entries(fields).forEach(([key, field]) => {
      fieldsCopy[key] = field.copy();
    });
    return fieldsCopy;
  }

  _configureBlacklist() {
    this._blacklistVariables_ = [
      '_cache_',
      '__fields__',
      '_fields',
      '_table'
    ];
    this._blacklistVariablesNoWrite_ = [
      '_blacklist_',
      '_blacklistVariables_',
      '_blacklistVariablesNoWrite_',
      '_blacklistGettersSetters_',
      '_blacklistFunctions_',
      '_createdTime',
      '_id',
    ];
    this._blacklistGettersSetters_ = [
      '_fields_',
      'createdTime',
      'fields',
      'id',
      'table'
    ];
    this._blacklistFunctions_ = [
      'getField',
      'has',
      'get',
      'put',
      'save',
      'update',
      'dangerouslyReplace',
      '_copyFields'
    ];

    this._blacklist_ = []
      .concat(this._blacklistVariables_)
      .concat(this._blacklistVariablesNoWrite_)
      .concat(this._blacklistGettersSetters_)
      .concat(this._blacklistFunctions_);

    this._blacklistVariables_.forEach((key) => {
      Object.defineProperty(this, key, {
        value: this[key],
        enumerable: false,
        configureable: false,
        writable: true
      })
    });

    this._blacklistVariablesNoWrite_.forEach((key) => {
      Object.defineProperty(this, key, {
        value: this[key],
        enumerable: false,
        configureable: false,
        writable: false
      })
    });

    this._blacklistFunctions_.forEach((key) => {
      Object.defineProperty(this, key, {
        value: this[key],
        enumerable: false,
        configureable: false,
        writable: false
      })
    });
  }

  stringify(replacer, space) {
    return JSON.stringify({
      id: this.id,
      fields: {
        ...Object.entries(this.fields).reduce((fields, [key, field]) => {
          let value = field.value;
          if (value instanceof Record)
            value = `Record [${value.table.name} : ${value.id}]`;
          if (Array.isArray(value))
            value = value.map((value) => {
              if (value instanceof Record)
                return `Record [${value.table.name} : ${value.id}]`;
              else
                return value;
            });
            fields[key] = value === undefined ? null : value
          return fields;
        }, {})
      },
      createdTime: this.createdTime
    }, replacer, space);
  }
}

module.exports = Record;
