const Airtable = require('../Airtable');


const key = '';
const base = 'appj0mDe8gFv0QQy8';

const Test = Airtable.defineTable('Test', key, base, {
  email: {
    name: 'Email',
    type: Airtable.FieldTypes.Email,
    primary: true
  },
  age: {
    name: 'Age',
    type: Airtable.FieldTypes.NumberField,
    format: 'Integer',
    default: 18
  },
  Address: {
    type: Airtable.FieldTypes.SingleLineText
  }
});

// console.log('query spam')
// Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query();Test.query().then(() => console.log('sending real query'));
const records = Test.query().then((records) => {
  if (records !== undefined || records.length !== 0) {
    records.forEach((record, index) => {
      console.log('Record: ', record.stringify(null, 2))
      if (record.has('email') && index === 1) {
        // record.fields.email.value = 'jeff';
        record.email = 'jeff';
        record.save();
        record.age = 27;
        record.fields.bob = 'hi there';
        record.save();
        console.log(record.bob);
        console.log('Record: ', record.stringify(null, 2))
      }
    });
  }
}).catch(error => console.log(error.stack));

module.exports = Test;
