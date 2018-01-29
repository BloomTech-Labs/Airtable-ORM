const Record = require('./Record');
const Request = require('./Request');
const Table = require('./Table');

/* Airtable
 * Parameters:
 *   key: <String>
 *     The API key from Airtable.com.
 *   limit: <Number>
 *     The number of requests per second the Airtable Object tied to the key
 *     should send. This can be a Float.
 *   queueCap: <Integer>
 *     The number of requests that can sit in the queue before an error is thrown.
 *     A number 0 or less will be set to 0 and will siginify no queue. The default
 *     queueCap is 15 minutes worth of requests.
 * Return:
 *   A new Airtable Object or an existing Airtable Object if the same key
 *   as an already initialized Airtable Object is used.
 */
class Airtable {

  /* static get _airtables
   * Return:
   *   A key-value Object of {key: Airtable Object} for all initialized Airtable Objects.
   */
  static get _airtables() {
    if (this._airtables_ === undefined)
      this._airtables_ = {}
    return this._airtables_;
  };

  /* static get printRecordChanges
   * Return:
   *   A Boolean representing whether or not Record changes will be printed to the console
   *   during a save operation.
   */
  static get printRecordChanges() {
    return Record.printRecordChanges;
  }

  /* static get printRequests
   * Return:
   *   A Boolean representing whether or not Requests will be printed to the console
   *   as they are sent.
   */
  static get printRequests() {
    return Request.printRequests;
  }

  /* static set _airtables
   * This should not be used. It is used to set the Object that tracks initialized\
   * Airtable Objects so that the same queue cannot be used for two instances of an Airtable
   * Object. This is used to prevent exceeding the Airtable Rest API request limit.
   */
  static set _airtables(value) {
    if (typeof value !== 'object' || Array.isArray(value))
      throw new Error('AirtableError: _airtables must be a key-value object.');
    this._airtables_ = value;
  }


  /* static set printRecordChanges
   * Parameters:
   *   value:
   *     A Boolean representing whether or not Record changes should be printed to the console
   *     during a save operation.
   */
  static set printRecordChanges(value) {
    Record.printRecordChanges = value;
  }

  /* static set printRequests
   * Parameters:
   *   value:
   *     A Boolean representing whether or not Requests should be printed to the console
   *     as they are sent.
   */
  static set printRequests(value) {
    Request.printRequests = value;
  }

  /* static defineBase(name, base)
   * Parameters:
   *   name: <String>
   *     How you would like to refer to the base.
   *   base: <Anything>
   *     This can be anything.
   * This is just a helper function which allows you to store base info
   * and easily retrieve it later with Airtable.getBase(name).
   */
  static defineBase(name, base) {
    if (this._bases === undefined) {
      this._bases = {};
    }
    if (typeof name !== 'string') {
      const error = new Error(
        `defineBase: 'name' must be a string.\n` +
        `Received: ${name}`
      );
      error.name = 'AirtableError';
      throw error;
    }
    this._bases[name] = base;
  }

  /* static defineTable(name, key, base, fields)
   * This just creates a new Airtable Object with the supplied key, or uses an existing
   * Airtable Object if one has already been created with that key, and calls Airtable.defineTable
   */
  static defineTable(name, key, base, fields) {
    if (name === undefined || key === undefined || base === undefined || fields === undefined)
      throw new Error('AirtableError: Airtable.defineTable requires a name, key, base, and fields.');
    return new Airtable(key).defineTable(name, base, fields);
  }

  /* static findTable(search, key)
   * Parameters:
   *   search: <String>
   *     The name of the Table.
   *   search: <Function>
   *     Rather than providing a name, you can provide a callback that will pass
   *     Table Objects to the callback as it searches through tables. Returning
   *     true from the callback will end the search and return the Table.
   *   [key: <String>]
   *     The API key that was used to define the Table.
   *     If key is undefined or null, it will search through all existing
   *     Airtable Objects and return the first one that matches the given name.
   * Return:
   *   A Table Object or undefined if no Table is found, name is not a String,
   *   or key is not a String or undefined or null.
   * Refer to Airtable.findTable for more as this function essentially just calls that.
   */
  static findTable(search, key) {
    if (typeof name !== 'string')
      return;
    const searchTable = (key) => {
      if (this._airtables[key] !== undefined)
        return this._airtables[key].findTable(name);
    }
    if (key !== null && key !== undefined && typeof key === 'string') {
      return searchTable(key);
    } else if (key == null || key === undefined) {
      return;
    } else {
      const keys = Object.keys(this._airtables);
      for (let i = 0; i < keys.length; i++) {
        const table = searchTable(keys[i]);
        if (table !== undefined)
          return table;
      }
    }
  }

  /* static getBase(name)
   * Parameters:
   *   name: <String>
   *     The name of the base.
   * Return:
   *   Returns whatever the base was defined as or undefined.
   */
  static getBase(name) {
    if (typeof name !== 'string')
      return;
    return this._bases[name];
  }

  /* static getTable(key, name, base)
   * Parameters:
   *   key: <String>
   *     The API Key from Airtable.com.
   *   name: <String>
   *     The name of the Table as it is on Airtable.com.
   *   base: <String>
   *     The Base ID from Airtable.com.
   * Return:
   *   Returns a Table or undefined if the key has not been used to create
   *   an Airtable Object or if no table was found.
   * This just calls Airtable.getTable
   */
  static getTable(key, name, base) {
    if (this._airtables[key] === undefined) {
      return undefined;
    }
    return this._airtables[key].getTable(name, base);
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

  /* get _cooldown
   * Return:
   *   A Date Object representing when this Object can start sending requests again.
   */
  get _cooldown() {
    return this._cooldown_;
  }

  /* get _maskedKey
   * Return:
   *   A String of the key with a portion of it masked with asterisks.
   */
  get _maskedKey() {
    return `${this.key.substring(0, this.key.length - 9)}*****${this.key.substring(this.key.length - 4)}`;
  }

  /* get _queueCapDefault
   * Return:
   *   An Integer of the default queueCap of 15 minutes worth of requests.
   */
  get _queueCapDefault() {
    return ~~(this.limit * 60 * 15);
  }

  /* get key
   * Return:
   *   A String of the API Key from Airtable.com used to initialize this Object.
   */
  get key() {
    return this._key;
  }

  /* get limit
   * Return:
   *   A Number of the requests per second this Object is allowed to send.
   */
  get limit() {
    return this._limit;
  }

  /* get queue
   * Return:
   *   An Array of Request Objects waiting to be sent.
   */
  get queue() {
    if (!Array.isArray(this._queue))
      this._queue = [];
    return this._queue;
  }

  /* get queueCap
   * Return:
   *   An Integer representing how large the queue can get before an error is thrown.
   */
  get queueCap() {
    if (isNaN(this._queueCap))
      this.queueCap = this._queueCapDefault;
    return ~~(this._queueCap);
  }

  /* get tables
   * Return:
   *   A key-value Object of { baseID: { tableName: Table Object } }
   */
  get tables() {
    return this._tables;
  }

  /* set _cooldown
   * Parameters:
   *   epoch: <Date>
   *     A Date Object set to the time that this Object can start sending requests again.
   */
  set _cooldown(epoch) {
    this._cooldown_ = epoch;
  }

  /* set _maskedKey
   * This function cannot be used.
   */
  set _maskedKey(_) {
    return;
  }

  /* set _queueCapDefault
   * This function cannot be used.
   */
  set _queueCapDefault(_) {
    return;
  }

  /* set key
   * Parameters:
   *   key: <String>
   *     The API Key from Airtable.com
   * The key cannot be changed once set.
   */
  set key(key) {
    if (this.key !== undefined)
      throw new Error('AirtableError: key can not be changed! You should create a new Airtable Object for a different key.');
    if (typeof key !== 'string')
      throw new Error('AirtableError: key must be a String!');
    this._key = key;
  }

  /* set limit
   * Parameters:
   *   limit: <Number>
   *     Sets the request rate by number of requests per second.
   *     0 is treated as there being no limit to requests per second.
   *     Anything less than 0 is set to 0.
   *     Values that are NaN will be set to 5 which is the default limit that Airtable sets for their users.
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

  /* set queue
   * Parameters:
   *   queue: <Array>
   *     An empty Array or Array of Requests.
   * The queue cannot be changed once set.
   */
  set queue(queue) {
    if (this._queue !== undefined)
      throw new Error('AirtableError: queue can not be changed!');
    if (!Array.isArray(queue))
      throw new Error('AirtableError: queue must be an Array!');
    this._queue = queue;
  }

  /* set queueCap
   * Parameters:
   *   cap: <Integer>
   *     Sets the queueCap. Airtable will throw an error if the queue exceeds this cap.
   *     0 is treated as there not being a cap.
   *     Anything less than 0 is set to 0.
   *     Reset to the default queueCap (15 minutes worth of requests) by setting the cap to undefined or null. Other NaN values will throw an error.
   *     Floats will be converted to Integers by flooring them.
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

  /* set tables
   * Parameters:
   *   tables: <Object>
   *     An empty Object.
   * tables cannot be changed once set.
   */
  set tables(tables) {
    if (this.tables !== undefined)
      throw new Error('AirtableError: tables object can not be changed!');
    if (typeof tables !== 'object' || Array.isArray(tables))
      throw new Error('AirtableError: Expected a key-value Object but received a(n) ' + Array.isArray(tables) ? 'array' : typeof tables + '.');
    this._tables = {};
  }

  /* _execute()
   * This function is used to send Requests sitting in the queue.
   */
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

  /* _wait()
   * This function is used by Airtable._execute to wait until the next Request can be sent.
   */
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

  /* addTable(table)
   * Parameters:
   *   table: <Object>
   *     A Table Object.
   * Adds the Table to Airtable.get tables
   */
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

  /* defineBase(name, base)
   * This just calls Airtable.static defineBase
   */
  defineBase(name, base) {
    Airtable.defineBase(name, base);
  }

  /* defineTable(name, base, fields)
   * Parameters:
   *   name: <String>
   *     The name of the Table as it is on Airtable.com
   *   base: <String>
   *     The Base ID from Airtable.com
   *   fields: <Object>
   *     A key-value Object of Field Definitions.
   * Return:
   *   A Table Object.
   */
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
      throw error;
    }
  }

  /* findTable(search)
   * Parameters:
   *   search: <String>
   *     The name of the Table.
   *   search: <Function>
   *     Rather than providing a name, you can provide a callback that will pass
   *     Table Objects to the callback as it searches through tables. Returning
   *     true from the callback will end the search and return the Table.
   * Return:
   *   A Table Object or undefined.
   */
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

  /* getBase(name)
   * This just calls Airtable.static getBase
   */
  getBase(name) {
    if (typeof name !== 'string')
      return;
    return Airtable.getBase(name);
  }

  /* getTable(name, base)
   * Parameters:
   *  name: <String>
   *    The name of the Table as it is on Airtable.com
   * Return:
   *   A Table Object or undefined.
   */
  getTable(name, base) {
    if (typeof name !== 'string')
      return;
    return this.tables[base][name];
  }

  /* kill()
   * This function removes this Airtable Object from the saved Airtable instances,
   * stops the _execute loop, and empties the Request queue.
   */
  kill() {
    if (this.table === undefined || Airtable._airtables[this.key] === undefined)
      return;
    delete Airtable._airtables[this.key];
    if (this._timeout !== undefined)
      clearTimeout(this._timeout);
    this.queue.length = 0;
  }

  /* sendRequest(request)
   * Parameters:
   *   request: <Request>
   * This adds the provided Request to the queue and starts the _execute loop if it isn't already
   * running.
   */
  sendRequest(request) {
    if (request instanceof Request)
      this._queue.push(request)
    else
      throw new Error('RequestError: Expected a Request Object but received a(n) ' + typeof request + '.');
    if (this._running_ === false)
      this._execute();
  }
}

module.exports = Airtable;

module.exports.FieldTypes = require('./fields');
module.exports.FieldTypes.Date = module.exports.FieldTypes.DateField;
module.exports.FieldTypes.Number = module.exports.FieldTypes.NumberField;

module.exports.Request = Request;
