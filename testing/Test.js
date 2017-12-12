const Airtable = require('../Airtable');


const key = '';
const base = 'appj0mDe8gFv0QQy8';

const airtable = new Airtable(key);

airtable.defineBase('Test', base);

const Students = airtable.defineTable('Students', airtable.getBase('Test'), {
  email: {
    name: 'Email',
    type: Airtable.FieldTypes.Email,
    primary: true
  },
  name: {
    name: 'Name',
    type: Airtable.FieldTypes.SingleLineText
  },
  slackUsername: {
    name: 'Slack Username',
    type: Airtable.FieldTypes.SingleLineText
  },
  age: {
    name: 'Age',
    type: Airtable.FieldTypes.NumberField,
    format: 'Integer'
  },
  attendance: {
    name: 'Attendance',
    type: Airtable.FieldTypes.LinkToAnotherRecord,
    table: 'Attendance',
    multi: true
  }
});

const Attendance = airtable.defineTable('Attendance', airtable.getBase('Test'), {
  date: {
    name: 'Date',
    type: Airtable.FieldTypes.DateField,
    format: 'Friendly',
    primary: true
  },
  students: {
    name: 'Students',
    type: Airtable.FieldTypes.LinkToAnotherRecord,
    table: 'Students',
    multi: true
  },
  names: {
    name: 'Names',
    type: Airtable.FieldTypes.Lookup,
    table: 'Students',
    field: 'Name'
  },
});

Students.query().then((records) => {
  try {
    if (records !== undefined || records.length !== 0) {
      records.forEach((record, index) => {
        record.attendance.forEach((attendance) => {
          attendance.students.forEach((student) => {
            student.name = "bob";
          })
        })
        console.log(record.stringify(null, 2));
      });
      if (records.hasNextPage())
        records.nextPage().then((records) => {

        })
    }
  } catch (error) {
    console.error(error);
  }
}).catch(error => console.log(error.stack));
