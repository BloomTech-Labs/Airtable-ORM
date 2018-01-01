const Request = require('./Request');
const Table = require('./Table');
const Record = require('./Record');

class Airtable {
  static get _airtables() {
    if (this._airtables_ === undefined)
      this._airtables_ = {}
    return this._airtables_;
  };

  static get printRecordChanges() {
    return Record.printRecordChanges;
  }

  static get printRequests() {
    return Request.printRequests;
  }

  static defineTable(name, key, base, fields) {
    if (name === undefined || key === undefined || base === undefined || fields === undefined)
      throw new Error('AirtableError: Airtable.defineTable requires a name, key, base, and fields.');
    return new Airtable(key).defineTable(name, base, fields);
  }

  static defineBase(name, base) {
    if (this._bases === undefined) {
      this._bases = {};
    }
    this._bases[name] = base;
  }

  static getBase(name) {
    return this._bases[name];
  }

  static getTable(key, name, base) {
    if (this._airtables[key] === undefined) {
      return undefined;
    }
    return this._airtables[key].getTable(name, base);
  }

  static findTable(name, key) {
    const searchTable = (key) => {
      if (this._airtables[key] !== undefined)
        return this._airtables[key].findTable(name);
    }
    if (key !== null && key !== undefined)
      return searchTable(key);
    else {
      const keys = Object.keys(this._airtables);
      for (let i = 0; i < keys.length; i++) {
        const table = searchTable(keys[i]);
        if (table !== undefined)
          return table;
      }
    }
  }

  static set _airtables(value) {
    if (typeof value !== 'object' || Array.isArray(value))
      throw new Error('AirtableError: _airtables must be a key-value object.');
    this._airtables_ = value;
  }

  static set printRecordChanges(value) {
    Record.printRecordChanges = value;
  }

  static set printRequests(value) {
    Request.printRequests = value;
  }

  constructor(key, limit = 5, queueCap) {
    if (Airtable._airtables[key] !== undefined)
      return Airtable._airtables[key];
    Airtable._airtables[key] = this;
    this.key = key;
    this.limit = limit;
    this.queue = [];
    this.queueCap = queueCap;
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

  get queueCap() {
    if (isNaN(this._queueCap))
      this.queueCap = this._queueCapDefault;
    return this._queueCap;
  }

  get tables() {
    return this._tables;
  }

  set key(key) {
    if (this.key !== undefined)
      throw new Error('AirtableError: key can not be changed! You should create a new Airtable Object for a different key.');
    this._key = key;
  }

  /* set limit(limit)
   * Sets the request rate by number of requests per second.
   * 0 is treated as there being no limit to requests per second.
   * Anything less than 0 is set to 0.
   * Values that are NaN will be set to 5 which is the default limit that Airtable sets for their users.
   * Floats will be converted to Integers by flooring them.
   */
  set limit(limit) {
    if (isNaN(limit))
      limit = 5;
    else
      limit = Number(limit);
    if (limit < 0)
      limit = 0;
    this._limit = limit;
  }

  set queue(queue) {
    if (this.queue !== undefined)
      throw new Error('AirtableError: queue can not be changed!');
    this._queue = queue;
  }

  /* set queueCap
   * Sets the queueCap. Airtable will throw an error if the queue exceeds this cap.
   * 0 is treated as there not being a cap.
   * Anything less than 0 is set to 0.
   * Reset to the default queueCap (15 minutes worth of requests) by setting the cap to undefined or null. Other NaN values will throw an error.
   * Floats will be converted to Integers by flooring them.
   */
  set queueCap(cap) {
    if (cap === undefined || cap === null)
      cap = this._queueCapDefault;
    if (isNaN(cap))
      throw new Error('AirtableError: queueCap must be a number!');
    cap = ~~Number(cap);
    if (cap < 0)
      cap = 0;
    this._queueCap = cap;
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
    if (this.tables[table.base] === undefined)
      this.tables[table.base] = {};
    if (this.tables[table.base][table.name] !== undefined)
      throw new Error('AirtableError: A table with the same name as another was attempted to be defined.');
    const obj = {}
    obj[table.name] = table;
    Object.assign(this.tables[table.base], obj);
  }

  defineBase(name, base) {
    Airtable.defineBase(name, base);
  }

  defineTable(name, base, fields) {
    if (name === undefined || base === undefined || fields === undefined)
      throw new Error('AirtableError: defineTable requires a name, base, and fields.');
    try {
      if (fields.__strict__ !== true)
        fields.__strict__ = false;
      if (fields.__ignoreFieldErrors__ !== true)
        fields.__ignoreFieldErrors__ === false
      const strict = fields.__strict__;
      const ignoreFieldErrors = fields.__ignoreFieldErrors__;
      Object.entries(fields).forEach(([key]) => {
        if (typeof fields[key] !== 'object')
          return delete fields[key];
        Record._checkField(key)
        if (fields[key].strict !== true && fields[key].strict !== false)
          fields[key].strict = strict;
        if (fields[key].__ignoreFieldErrors__ !== true && fields[key].__ignoreFieldErrors__ !== false)
          fields[key].__ignoreFieldErrors__ = ignoreFieldErrors;
      });
      this.addTable(new Table(this, base, name, fields));
      return this.tables[base][name];
    } catch (error) {
      console.log(error);
    }
  }

  getBase(name) {
    return Airtable.getBase(name);
  }

  getTable(name, base) {
    return this.tables[base][name];
  }

  findTable(search) {
    if (typeof search === 'string' || typeof search === 'function') {
      const results = [];
      const bases = Object.keys(this.tables);
      for (let i = 0; i < bases.length; i++) {
        const base = this.tables[bases[i]];
        const tables = Object.values(base);
        for (let j = 0; j < tables.length; j++) {
          const table = tables[i];
          if (typeof search === 'function') {
            const res = search(table);
            if (res === true)
              return table;
          } else if (table.name === search) {
            results.push(table);
          }
        }
      }
      if (typeof search === 'string')
        return results;
    }
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

  _wait() {
    return new Promise((resolve) => {
      const waitForCooldown = () => {
        if (this._cooldown !== undefined && (new Date() / 1000) < this._cooldown)
          setTimeout(waitForCooldown, Math.ceil(this._cooldown - (new Date() / 1000)) * 1000);
        else
          resolve();
      }
      if (this._cooldown !== undefined && (new Date() / 1000) < this._cooldown)
        return waitForCooldown();
      if (this.limit <= 0)
        resolve();
      else
        this._timeout = setTimeout(() => {
          // check to make sure an error didn't happen while we were waiting
          if (this._cooldown !== undefined && (new Date() / 1000) < this._cooldown)
            return waitForCooldown();
          else
            resolve();
        }, 1000/this.limit);
    });
  }

  _execute() {
    if (this._running_ === true)
      return;
    const execute = () => {
      if (this.queueCap > 0 && this.queue.length > this.queueCap) {
        console.log(new Error(
          `AirtableError: The Request queue for Airtable '${this._maskedKey}' has exceeded its limit of ${this.queueCap} Requests. ` +
          `You may need to request an API Key Request Limit increase.`
        ));
        process.exit(1);
      }
      this._running_ = true;
      this._wait().then(() => {
        if (this.queue.length > 0) {
          const request = this._queue.shift();
          if (request instanceof Request)
            request.send(this.key).catch((error) => {
              if (error.response !== undefined) {
                if (error.response.status === 429) {
                  console.error(new Error(
                    `AirtableError: Airtable has sent back a 429 error indicating that the API Request Limit has been exceeded for ` +
                    `key ${this._maskedKey}. Make sure there aren't multiple servers using this key. Otherwise, you may need to ` +
                    `request an API Key Request Limit increase.`
                  ));
                  console.info(`Airtable: Waiting 32 seconds before resuming operation of Airtable ${this._maskedKey} due to receiving 429 error.`);
                  this._cooldown = (new Date() / 1000) + 32;
                  this.sendRequest(request);
                }
              }
            });
          else
            console.warn("An Airtable queue was given a request that wasn't a Request Object. Please use sendRequest(<Request>). Ignoring...");
          execute();
        } else {
          this._running_ = false;
        }
      });
    }
    execute();
  }

  get _maskedKey() {
    return `${this.key.substring(0, this.key.length - 9)}*****${this.key.substring(this.key.length - 4)}`;
  }

  get _queueCapDefault() {
    return this.limit * 60 * 15;
  }

  get _cooldown() {
    return this._cooldown_;
  }

  set _cooldown(epoch) {
    this._cooldown_ = epoch;
  }

  set _maskedKey(value) {
    return;
  }

  set _queueCapDefault(value) {
    return;
  }

}

module.exports = Airtable;

module.exports.FieldTypes = require('./fields');
module.exports.FieldTypes.Date = module.exports.FieldTypes.DateField;
module.exports.FieldTypes.Number = module.exports.FieldTypes.NumberField;

module.exports.Request = Request;
