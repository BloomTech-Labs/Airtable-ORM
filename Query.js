class Query {
  constructor(table) {
    this._query = {};
  }

  exec(setupLinks = true) {
    return table.query(this._query, setupLinks);
  }

  filter(filter = {}) {

    return this;
  }

  find(find = {}) {

    return this;
  }

  findOne(find = {}) {
    this._query.maxRecords = 1;
    return find(find);
  }

  select(fields = []) {

    return this;
  }

  settings({ pageSize = 100, view = "Grid", maxRecords }) {

    return this;
  }

  where(where = {}) {

    return this;
  }

  sort(sort) {

    return this;
  }
}

module.exports = Query;
