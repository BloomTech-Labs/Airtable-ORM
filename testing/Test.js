const Airtable = require('../Airtable');
const security = require('../security.json');

Airtable.printRequests = true;
Airtable.printRecordChanges = false;

const key = security.keys.api;
const base = security.bases.Test;

const airtable = new Airtable(key, 5);

airtable.defineBase(base.name, base.id);

const Students = airtable.defineTable(base.tables.Students, base.id, {
  // __strict__: true,
  // __ignoreFieldErrors__: 'ignore',
  email: {
    name: 'Email',
    type: Airtable.FieldTypes.Email,
    primary: true
  },
  name: {
    name: 'Name',
    type: Airtable.FieldTypes.SingleLineText
  },
  age: {
    name: 'Age',
    type: Airtable.FieldTypes.Number,
    format: 'Integer'
  },
  attendance: {
    name: 'Attendance',
    type: Airtable.FieldTypes.LinkToAnotherRecord,
    table: 'Attendance',
    multi: true
  },
  attachment: {
    name: 'Attachment',
    type: Airtable.FieldTypes.Attachment
  },
  autoNumber: {
    name: 'Auto Number',
    type: Airtable.FieldTypes.AutoNumber
  },
  barcode: {
    name: 'Barcode',
    type: Airtable.FieldTypes.Barcode
  },
  checkbox: {
    name: 'Checkbox',
    type: Airtable.FieldTypes.Checkbox
  },
  collaborator: {
    name: 'Collaborator',
    type: Airtable.FieldTypes.Collaborator,
    multi: true,
    mutable: true
  },
  count: {
    name: 'Count',
    type: Airtable.FieldTypes.Count,
    field: 'Attendance'
  },
  createdtime: {
    name: 'Created Time',
    type: Airtable.FieldTypes.CreatedTime,
    dateFormat: 'Friendly',
    timeFormat: 12,
    includeDay: true,
    includeTime: true,
    includeSeconds: true
  },
  currency: {
    name: 'Currency',
    type: Airtable.FieldTypes.Currency
  },
  date: {
    name: 'Date',
    type: Airtable.FieldTypes.Date,
    dateFormat: 'US',
    includeDay: true
  },
  formula: {
    name: 'Formula',
    type: Airtable.FieldTypes.Formula
  },
  longText: {
    name: 'Long Text',
    type: Airtable.FieldTypes.LongText
  },
  // lookup: {
  //   name: 'Lookup',
  //   type: Airtable.FieldTypes.Lookup,
  // },
  multipleSelect: {
    name: 'Multiple Select',
    type: Airtable.FieldTypes.MultipleSelect,
    options: [
      'Option 1',
      'Option 2',
      'Option 3'
    ]
  },
  percent: {
    name: 'Percent',
    type: Airtable.FieldTypes.Percent
  },
  phoneNumber: {
    name: 'Phone Number',
    type: Airtable.FieldTypes.PhoneNumber
  },
  rating: {
    name: 'Rating',
    type: Airtable.FieldTypes.Rating,
  },
  rollup: {
    name: 'Rollup',
    type: Airtable.FieldTypes.Rollup
  },
  singleSelect: {
    name: 'Single Select',
    type: Airtable.FieldTypes.SingleSelect,
    options: [
      'Option 1',
      'Option 2',
      'Option 3'
    ]
  },
  url: {
    name: 'URL',
    type: Airtable.FieldTypes.URL
  }
});

const Attendance = airtable.defineTable(base.tables.Attendance, airtable.getBase('Test'), {
  date: {
    name: 'Date',
    type: Airtable.FieldTypes.DateField,
    primary: true,
    dateFormat: 'Friendly',
    includeDay: true,
    includeTime: true,
    includeSeconds: true
  },
  students: {
    name: 'Students',
    type: Airtable.FieldTypes.LinkToAnotherRecord,
    table: 'Students',
    multi: true
  },
  names: {
    name: 'Names',
    type: Airtable.FieldTypes.UnknownField,
    table: 'Students',
    field: 'Name'
  }
});

Students.query({ pageSize: 3 }, true).then((students) => {
  Attendance.query().then((attendance) => {
    try {
      if (students !== undefined && students.length !== 0) {
        const jourdan = students[0];
        const bob = students[1];
        const susan = students[2];
        console.log(jourdan.stringify(null, 2));
        // console.log(bob.stringify(null, 2));
        // console.log(susan.stringify(null, 2));
        console.log(jourdan.fgetk('rating').toStars());
        // jourdan.percent = 60;
        // const msf = jourdan.fgetk('multipleSelect');
        // msf.value = ['hello'];
        // console.log(jourdan.multipleSelect);
        // jourdan.phoneNumber = '1231234567';
        // let current = 0;
        // const addAllDates = () => {
        //   if (current < attendance.length)
        //     jourdan.fields.attendance.addRecord(attendance[current++]).then(() => addAllDates());
        //   else
        //     jourdan.save().catch((error) => {
        //       console.error(error.stack);
        //       console.error(JSON.stringify(error.response.data, null, 2));
        //     });
        // }
        // addAllDates();
        // attendance.forEach((date) => {
        //   jourdan.fields.attendance.removeRecord(date);
        // });
        console.log(jourdan.lookup);
        jourdan.fields.attendance.addRecord('recp2P0e5QixCYzs5').then(() => {

        })
        jourdan.save().catch((error) => {
          console.error(error.stack);
          console.error(JSON.stringify(error.response.data, null, 2));
        });
      }
    } catch (error) {
      console.error(error.stack);
    }
  }).catch(error => console.log(error.stack));
}).catch(error => console.log(error.stack));
