const Request = require('./Request');
const Table = require('./Table');

class Airtable {
  static get _airtables() {
    if (this._airtables_ === undefined)
      this._airtables_ = {}
    return this._airtables_;
  };

  static defineTable(name, key, base, fields) {
    if (name === undefined || key === undefined || base === undefined || fields === undefined)
      throw new Error('AirtableError: Airtable.defineTable requires a name, key, base, and fields.');
    return new Airtable(key).defineTable(name, base, fields);
  }

  constructor(key, limit = 5) {
    if (Airtable._airtables[key] !== undefined)
      return Airtable._airtables[key];
    Airtable._airtables[key] = this;
    this.key = key;
    this.limit = limit;
    this.queue = [];
    this.tables = {};
    this._running_ = false;
  }

  get key() {
    return this._key;
  }

  get limit() {
    return this._limit;
  }

  get queue() {
    return this._queue;
  }

  get tables() {
    return this._tables;
  }

  set key(key) {
    if (this.key !== undefined)
      throw new Error('AirtableError: key can not be changed! You should create a new Airtable Object for a different key.');
    this._key = key;
  }

  set limit(limit) {
    if (this.limit !== undefined)
      throw new Error('AirtableError: table can not be changed!');
    if (isNaN(limit))
      throw new Error('AirtableError: limit must be a number!');
    this._limit = limit;
  }

  set queue(queue) {
    if (this.queue !== undefined)
      throw new Error('AirtableError: table can not be changed!');
    this._queue = queue;
  }

  set tables(tables) {
    if (this.tables !== undefined)
      throw new Error('AirtableError: tables object can not be changed!');
    if (typeof tables !== 'object' || Array.isArray(tables))
      throw new Error('AirtableError: Expected a key-value Object but received a(n) ' + Array.isArray(tables) ? 'array' : typeof tables + '.');
    this._tables = {};
  }

  addTable(table) {
    if (!(table instanceof Table))
      throw new Error('AirtableError: Expected table to be a Table but received a(n) ' + typeof table + '.');
    if (this.tables[table.name] !== undefined)
      throw new Error('AirtableError: A table with the same name as another was attempted to be defined.');
    this.tables[table.name] = table;
  }

  defineTable(name, base, fields) {
    if (name === undefined || base === undefined || fields === undefined)
      throw new Error('AirtableError: defineTable requires a name, base, and fields.');
    this.addTable(new Table(this, base, name, fields));
    return this.tables[name];
  }

  getTable(name) {
    return this.tables[name];
  }

  sendRequest(request) {
    if (request instanceof Request)
      this._queue.push(request)
    else
      throw new Error('RequestError: Expected a Request Object but received a(n) ' + typeof request + '.');
    if (this._running_ === false)
      this._execute();
  }

  kill() {
    if (this.table === undefined || Airtable._airtables[this.key] === undefined)
      return;
    delete Airtable._airtables[this.key];
    if (this._timeout !== undefined)
      clearTimeout(this._timeout);
  }

  _wait(ms) {
    return new Promise(resolve => this._timeout = setTimeout(resolve, ms));
  }

  _execute() {
    if (this._running_ === true)
      return;
    const execute = async () => {
      if (this.queue.length > 0) {
        this._running_ = true;
        if (this.limit > 0)
          await this._wait(1000/this.limit);
        const request = this._queue.shift();
        if (request instanceof Request)
          request.send(this.key);
        else
          console.warn("An Airtable queue was given a request that wasn't a Request Object. Please use sendRequest(<Request>). Ignoring...");
        execute();
      } else {
        this._running_ = false;
      }
    }
    execute();
  }

}

module.exports = Airtable;

module.exports.FieldTypes = require('./fields');

module.exports.Request = Request;
