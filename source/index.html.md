---
title: Airtable ORM

toc_footers:
  - <a href='https://github.com/Lambda-School-Labs/Airtable-ORM'>View API</a>

includes:
  - objects
  - field_types
  - strict
  - examples

search: true
---

# Introduction

<aside class="notice">
To differentiate between Airtable.com and Objects/Airtable, Airtable.com refers and links to the website while Airtable refers and links to the Object 'Airtable' used by this API.
</aside>

Welcome to the Airtable ORM by [LambdaSchool](https://lambdaschool.com)! This is a wrapper for the Airtable REST API and was inspired by Mongoose. Pretty much everything has been abstracted away to allow you to start interacting with your data with as little setup as possible.

## Installation

`npm install Lambda-School-Labs/Airtable-ORM`

## Getting Started

>Getting Started

```javascript
const Airtable = require('Airtable');
const security = require('./security.json');

const key = security.apiKey;
const baseID = 'appj0mDe8gFv0QQy8';
const tableName = 'Test';

const airtable = new Airtable(key);
```

You'll need to get your API Key from [Airtable.com](https://airtable.com). To find it, go to your [account](https://airtable.com/account) and scroll down to generate an API Key.

You'll then need to get the ID of the Base that you want to work in. To find it, go into your Base, click the info button on the top right (a question mark icon), and click API documentation. Once you are there, copy the ID from the URL. You'll see something like `https://airtable.com/appj0mDe8gFv0QQy8/api/docs#curl/introduction` where `appj0mDe8gFv0QQy8` is your Base ID.

You may want to store these values in a JSON file if you are planning on using multiple files to set up your [Table](#table) definitions.

In this example, we start by importing [Airtable](#airtable) and security.json which contains our API Key. We then create variables to hold our API Key, the Base ID, and the name of the Table (this has to be the exact same as what you named the table on Airtable.com).

Next we initialize Airtable, giving it our key. You can also provide it with a `limit` and a `queueCap` in that order. Refer to Airtable to learn more about what those parameters do.

We will then define our Table, storing it in a variable for later use. In most cases you will likely want to do `module.exports = Test`, although you can also use `Airtable.getTable(apiKey, tableName, baseID)` or other variants mentioned in Airtable to import your Table into other files.

We will define our Table by providing airtable.defineTable() with the name of the Table as it is on Airtable.com, the Base ID, and then finally an object representing our Table Definition.

<div><!-- spacing --></div>

### Table Definitions

>Table Definitions

```javascript
const Test = airtable.defineTable(tableName, baseID, {
  email: {
    name: 'Email',
    type: Airtable.FieldTypes.Email,
    primary: true
  },
  age: {
    name: 'Age',
    type: Airtable.FieldTypes.Number,
    format: 'Integer'
  }
});
```

> Note that you do not need to initialize Airtable. You can either do it like the example or you can simply do:

```javascript
const Table = Airtable.defineTable(tableName, apiKey, baseID, tableDefinition)
```

[Airtable.com](https://airtable.com) does not provide a way for developers to retrieve information about [Field](#field) configurations. To get around this, you must tell the API how you want your Fields to operate.

To keep this introduction short, we are only going to go over two [Field Types](#field-types). This should provide enough information to get an idea of how this works, although more in-depth [Examples](#examples) are provided.

The first Field we define is `email`. On Airtable.com this Field is our primary key and as such, we have `primary` set to true. By doing this we can later reference this Field's value by doing `record.primaryField`.

All Fields require a `name` and `type`. The `name` of the Field must be the exact same as it is on Airtable.com. `type` is a Field Type which tells the API how to interact with this data as it comes in. This is necessary as Airtable.com does not send empty fields (including empty Strings, `false` Booleans, etc) and the API needs to know what format to send the data back in, in order to avoid errors that result in the entire save operation being rejected.

In `age` we also define the `format` for this [NumberField](#number-field). `format` is one of many configurations available for NumberField. By setting this Field's `format` to `'Integer'` we tell the API that it should ensure that Numbers we provide it are Integers. The default behavior for this Field is to floor any Floats it receives. It can also accept Numbers that come in as Strings. ie, `record.age = '13.24'` will be automatically corrected to `record.age = 13`, except for in [Strict](#strict). It's important to note that the keys in your Table Definition can not be the same as propeties of the Record Object. Reference [Record](#record) to view blacklisted keys.

<aside class="notice">
If you do not change any settings when you create a field on Airtable.com, you do not need to define any settings here. Every Field configuration has the same defaults as Airtable.com. You will still need to provide 'name', 'type', and if the field is the primary key, you'll need to provide 'primary'
</aside>

To summarize, a Table Definition is a key-value Object of Field Definitions. Every Field Definition will at least contain a `name` and a `type`. If the Field is the primary key, it will also contain `primary: true`. Most Field Type have many configurations and you should ensure that they have been properly defined. Not doing so puts you at a higher risk of getting errors back from Airtable.com rather than having the API catch them before a save request is sent. It's important to clean your data before setting the value of a Field, however all Fields try to correct it to avoid errors and inconsistent data. If these corrections will not work for you, you can run the Field in Strict.

<div><!-- spacing --></div>

### Creating Records

>Creating Records

```javascript
const newRecord = Test.getBlankRecord();
newRecord.primaryField = 'bob@gmail.com';
newRecord.age = 85;
newRecord.create().then((record) => {
  console.log(record.stringify(null, 2));
}).catch(error => console.log(error.toString()));
```

```javascript
const newRecord = Test.getBlankRecord();
newRecord.email = 'bob@gmail.com';
newRecord.age = 85;
Test.createRecord(newRecord).then((record) => {
  console.log(record.stringify(null, 2));
}).catch(error => console.log(error.toString()));
```

```javascript
Test.createRecord().then((record) => {
  record.email = 'bob@gmail.com';
  record.age = 85;
  record.save().then((record) => {
    console.log(record.stringify(null, 2));
  }).catch(error => console.log(error.toString()));
}).catch(error => console.log(error.toString()));
```

```javascript
Test.createRecord({ email: 'bob@gmail.com', age: 85 }).then((record) => {
  console.log(record.stringify(null, 2));
}).catch(error => console.log(error.toString()));
```

>Output of all the above statements is the same:

```json
{
  "email": "bob@gmail.com",
  "age": 85
}
```

There are several ways you can create a [Record](#record). You can create one by calling [Table.getBlankRecord()](#table-getblankrecord) which gives you a Record Object where all of the Fields are blank. Once you fill in the data that you want to store in your new (not yet created) Record, you can call [Record.create()](#record-create). Record.create() returns a Promise which resolve a Record Object, or `undefined` if no Record was returned from [Airtable.com](https://airtable.com).

Another option would be to just call [Table.createRecord(newRecord)](#table-createrecord). Record.create() just calls Table.createRecord() so both methods are equivalent. If you call Table.createRecord without any arguments, it will return a Promise which resolves a created blank Record. This function might be the easiest/cleanest to use in cases where you want to create a Record where you don't necessarily need to add a bunch of data to it right away. As you can see in one of the examples, you can give it a key-value Object telling it what values you want it to set your Fields to. It's important to note, however, that you must provide it with the keys from your Table Definition or it will throw an error because it is unable to find what type of [Field](#field) the offending value should go in.

<div><!-- spacing --></div>

### Queries

>Queries

```javascript
Test.query().then((records) => {
  records.forEach((record) => {
    record.age++;
    record.save().then((record) => {
      console.log(record.stringify(null, 2));
    }).catch(error => console.log(error.toString()));
  });
}).catch(error => console.log(error.toString()));

```

>Output:

```json
{
  "email": "bob@gmail.com",
  "age": 86
}
```


<aside class="notice">
As of right now, the Query Object has not been abstracted. You can pass in an Object containing the properties defined in the Airtable Rest API for <code>List records</code>. ie, <code>{ fields, filterByFormula, maxRecords, pageSize, sort, view, offset }</code>.
</aside>

In the example, our query returned something we called `records`. This is a [RecordArray](#recordarray) and will never be `null` or `undefined`. A RecordArray is simply an Array of Records with a some added functionality. You should definitely reference its docs before getting started on your project.

`record` is a [Record](#record) Object and if you notice, we can access `age` from our [Table](#table) Definition by doing `record.age`. Behind the scenes, `record.age` is the same as doing `record.fields.age.value`. This is important to note as, while you will interact will most [Field Types](#field-types) by only needing to get and set their value, some Field Types have useful functions to help you better interact with them. To get the actual [Field](#field) Object, you can do `record.fields.age` or `record.fget('Age')` or `record.fgetk('age')`.

Finally, after modifying `age`, we call `record.save()` which figures out what Fields changed and sends a `PATCH` [Request](#request) to [Airtable.com](https://airtable.com), only containing modified Fields. If none of the Fields on a Record were modified, no Request is sent. If Airtable.com sends back an error, you may access the data through `error.response.data` where `error` refers to the `error` in our `.save().catch(error)`.
