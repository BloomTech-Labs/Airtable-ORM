# Field Types

## Attachment

- Attachment
    - [Field](#field)

Attachments allow you to add images, documents, or other files which can then be viewed or downloaded.

| Functions                              |
| -------------------------------------- |
| [constructor](#attachment-constructor) |
| [get value](#attachment-get-value)     |
| [set value](#attachment-set-value)     |

### Attachment.constructor

<aside class="warning">
  Note that you may only remove Attachments. They cannot be added and
  data within an Attachment Object cannot be changed. Adding Attachments
  (even if they are valid and pulled from another record) will throw a
  422 Error when the Record fails to save.
</aside>

>Attachment.constructor(name, value [, config])

```javascript
  const attachment = new Attachment("Name", []);
```

Initializes a new Attachment Field.

<aside class="parameters">
  <p class="title"><span>Parameters</span></p>
  <p class="parameter">
    <span class="name">name</span>
    <span class="type">String</span>
    <span class="description">
      The name of the Field as it is on <a href="https://airtable.com">Airtable.com</a>.
    </span>
  </p>
  <p class="parameter">
    <span class="name">value</span>
    <span class="type">Array</span>
    <span class="description">
      Should be an Array of key-value Objects representing an Attachment.
    </span>
  </p>
</aside>

<div><!-- spacing --></div>

### Attachment.get value

>Attachment.get value()

```javascript
console.log(JSON.stringify(attachment.value, null, 2));
```

> Output:

```json
[
  {
    "id": "attK0FiU1zdSmwsYC",
    "url": "https://dl.airtable.com/i9vRAoM9SYOC7BZCou2Z_008-FUNNY-CAT-MEME.jpg",
    "filename": "008-FUNNY-CAT-MEME.jpg",
    "size": 196879,
    "type": "image/jpeg",
    "thumbnails": {
      "small": {
        "url": "https://dl.airtable.com/lGaVCc7QCKmDYDm8qjqL_small_008-FUNNY-CAT-MEME.jpg",
        "width": 31,
        "height": 36
      },
      "large": {
        "url": "https://dl.airtable.com/m2v43HvTHOMg3k7fj61s_large_008-FUNNY-CAT-MEME.jpg",
        "width": 512,
        "height": 595
      }
    }
  }
]
```

Returns the value of this Field in an immutable Array.

<aside class="parameters">
  <p class="title"><span>Return Value</span></p>
  <p class="parameter">
    <span class="type">Array</span>
    <span class="tag">immutable</span>
    <span class="description">
      Either an Array of key-value Objects representing Attachments or an empty Array.
    </span>
  </p>
</aside>

<div><!-- spacing --></div>

### Attachment.set value

>Attachment.set value(value)

```javascript
attachment.value = attachment.value.slice(1);
```

Used to set the value of this Field. Setting this Field to `null` or `undefined` will result in the Field being set to an empty Array.

<aside class="parameters">
  <p class="title"><span>Parameters</span></p>
  <p class="parameter">
    <span class="name">value</span>
    <span class="type">Array</span>
    <span class="description">
      Should be an Array of key-value Objects representing an Attachment.
    </span>
  </p>
</aside>

<div><!-- spacing --></div>

## AutoNumber

- AutoNumber
    - [Field](#field)

Automatically incremented unique counter for each record.

| Functions                                 |
| ----------------------------------------- |
| [constructor](#autonumber-constructor)    |
| [get \_changed](#autonumber-get-_changed) |
| [get value](#autonumber-get-value)        |
| [set \_changed](#autonumber-set-_changed) |
| [set value](#autonumber-set-value)        |

### AutoNumber.constructor

<aside class="notice">
  The value for this field is automatically incremented starting at 1. The value cannot be changed.
</aside>

>AutoNumber.constructor(name, value [, config])

```javascript
  const autoNum = new AutoNumber("Name", 1);
```

Initializes a new AutoNumber Field.

<aside class="parameters">
  <p class="title"><span>Parameters</span></p>
  <p class="parameter">
    <span class="name">name</span>
    <span class="type">String</span>
    <span class="description">
      The name of the Field as it is on <a href="https://airtable.com">Airtable.com</a>.
    </span>
  </p>
  <p class="parameter">
    <span class="name">value</span>
    <span class="type">Integer</span>
    <span class="description">
      Must be an Integer.
    </span>
  </p>
</aside>

<div><!-- spacing --></div>

### AutoNumber.get \_changed

<aside class="notice">
  This function is used by the API.
</aside>

>AutoNumber.get \_changed()

```javascript
console.log(autoNum._changed);
```

> Output:

```
false
```

A Boolean representing whether or not this Field has changed from its original value.

<aside class="parameters">
  <p class="title"><span>Return Value</span></p>
  <p class="parameter">
    <span class="type">Boolean</span>
    <span class="description">
      Will always be false.
    </span>
  </p>
</aside>

<div><!-- spacing --></div>

### AutoNumber.get value

>AutoNumber.get value()

```javascript
console.log(autoNum.value);
```

> Output:

```
1
```

<aside class="parameters">
  <p class="title"><span>Return Value</span></p>
  <p class="parameter">
    <span class="type">Integer</span>
    <span class="type">null</span>
    <span class="description">
      An Integer, or null if the Field is empty.
    </span>
  </p>
</aside>

<div><!-- spacing --></div>

<div><!-- spacing --></div>

### AutoNumber.set \_changed

<aside class="warning">
  This function cannot be used.
</aside>

### AutoNumber.set value

<aside class="warning">
  The value of this Field cannot be changed.
</aside>

## Barcode

- Barcode
    - [Field](#field)

Use the Airtable iOS or Android app to scan barcodes.

|  Functions                                   |
| -------------------------------------------- |
| [constructor](#barcode-constructor)          |
| [get \_changed](#barcode-get-_changed)       |
| [get \_saveValue](#barcode-get-_savevalue)   |
| [get barcodeText](#barcode-get-barcodetext)  |
| [get barcodeType](#barcode-get-barcodetype)  |
| [get value](#barcode-get-value)              |
| [set \_changed](#barcode-set-_changed)       |
| [set \_saveValue](#barcode-set-_savevalue)   |
| [set barcodeText](#barcode-set-barcodetext)  |
| [set barcodeType](#barcode-set-barcodetype)  |
| [set value](#barcode-set-value)              |

### Barcode.constructor

>Barcode.constructor(name, value [, config])

```javascript
  const barcode = new Barcode("Name", {
    text: 'text',
    type: 'code128'
  });
```

Initializes a new Barcode Field.

<aside class="parameters">
  <p class="title"><span>Parameters</span></p>
  <p class="parameter">
    <span class="name">name</span>
    <span class="type">String</span>
    <span class="description">
      The name of the Field as it is on <a href="https://airtable.com">Airtable.com</a>.
    </span>
  </p>
  <p class="parameter">
    <span class="name">value</span>
    <span class="type">Object</span>
    <span class="description">
      An Object containing <code>text</code> and <code>type</code>.<br>
      <code>text</code>: (default: <code>""</code>) A String representing what the barcode translates to.<br>
      <code>type</code>: (default: <code>'code128'</code>) A String which identifies the format of the barcode.
    </span>
  </p>
</aside>

<div><!-- spacing --></div>

### Barcode.get \_changed

>Barcode.get \_changed()

```javascript
console.log(barcode._changed);
```

> Output:

```
false
```

<aside class="notice">
  This function is used by the API.
</aside>

<aside class="parameters">
  <p class="title"><span>Return Value</span></p>
  <p class="parameter">
    <span class="type">Boolean</span>
    <span class="description">
      A Boolean representing whether or not this Field has changed from its original value.
    </span>
  </p>
</aside>

<div><!-- spacing --></div>

### Barcode.get \_saveValue

>Barcode.get \_saveValue()

```javascript
const saveValue = barcode._saveValue;
```

> saveValue:

```javascript
{
  text: 'text',
  type: 'code128'
}
```
<aside class="notice">
  This function is used by the API.
</aside>

This function is used by the API to convert the value stored in this field over to a value
that Airtable.com will accept (if it needs to convert anything).

<aside class="parameters">
  <p class="title"><span>Return Value</span></p>
  <p class="parameter">
    <span class="type">Object</span>
    <span class="description">
      If properties in this Field's value have been set to <code>null</code> or <code>undefined</code>, this function will fix the broken properties. It will set <code>text</code> to an empty String and <code>type</code> to <code>'code128'</code> (the format Airtable.com seems to convert all barcodes to).<br>
      <code>text</code>: (default: <code>""</code>) A String representing what the barcode translates to.<br>
      <code>type</code>: (default: <code>'code128'</code>) A String which identifies the format of the barcode.
    </span>
  </p>
</aside>

<div><!-- spacing --></div>

### Barcode.get barcodeText

>Barcode.get barcodeText()

```javascript
console.log(barcode.barcodeText);
```

>Output:

```javascript
'text'
```

This Field will always return a String.

<aside class="parameters">
  <p class="title"><span>Return Value</span></p>
  <p class="parameter">
    <span class="type">String</span>
    <span class="description">
      A String representing what the barcode translates to.
    </span>
  </p>
</aside>

<div><!-- spacing --></div>

### Barcode.get barcodeType

>Barcode.get barcodeType()

```javascript
console.log(barcode.barcodeType);
```

>Output:

```javascript
'code128'
```

This Field will always return a String.

<aside class="parameters">
  <p class="title"><span>Return Value</span></p>
  <p class="parameter">
    <span class="type">String</span>
    <span class="description">
      A String which identifies the format of the barcode.
    </span>
  </p>
</aside>

<div><!-- spacing --></div>

### Barcode.get value

>Barcode.get value()

```javascript
console.log(JSON.stringify(barcode.value, null, 2));
```

> Output:

```json
{
  "text": "text",
  "type": "code128"
}
```

<aside class="parameters">
  <p class="title"><span>Return Value</span></p>
  <p class="parameter">
    <span class="type">Object</span>
    <span class="description">
      An Object with the properties `type` and `text`.<br>
      <code>text</code>: A String representing what the barcode translates to.<br>
      <code>type</code>: A String which identifies the format of the barcode.
    </span>
  </p>
</aside>

<div><!-- spacing --></div>

### Barcode.set \_changed

<aside class="warning">
  This function cannot be used.
</aside>

### Barcode.set \_saveValue

<aside class="warning">
  This function cannot be used.
</aside>

### Barcode.set barcodeText

>Barcode.set barcodeText(text)

```javascript
barcode.barcodeText = 'hello';
```

<aside class="parameters">
  <p class="title"><span>Parameters</span></p>
  <p class="parameter">
    <span class="name">text</span>
    <span class="type">String</span>
    <span class="description">
      (default: <code>""</code>) A String representing what the barcode translates to.
    </span>
  </p>
</aside>

<div><!-- spacing --></div>

### Barcode.set barcodeType

>Barcode.set barcodeType(type)

```javascript
barcode.barcodeType = 'hello';
```

<aside class="parameters">
  <p class="title"><span>Parameters</span></p>
  <p class="parameter">
    <span class="name">type</span>
    <span class="type">String</span>
    <span class="description">
      (default: <code>'code128'</code>) A String which identifies the format of the barcode.
    </span>
  </p>
</aside>

<div><!-- spacing --></div>

### Barcode.set value

>Barcode.set value(value)

```javascript
barcode.value = 'hello';
barcode.value = {
  text: 'hello',
  type: 'code128'
};
```

A value type of String will set the `text` property of the barcode. An Object containing the properties `text` and `type` will set both values. This function calls [Barcode.set barcodeText](#barcode-set-barcodetext) and [Barcode.set barcodeType](#barcode-set-barcodetype). If value is a String and this Field does not have a `type` set, its `type` will be set to `'code128'`.

<aside class="parameters">
  <p class="title"><span>Parameters</span></p>
  <p class="parameter">
    <span class="name">value</span>
    <span class="type">String</span>
    <span class="description">
      A String representing what the barcode translates to.
    </span>
  </p>
  <p class="parameter">
    <span class="name">value</span>
    <span class="type">Object</span>
    <span class="description">
      An Object with the properties `type` and `text`.<br>
      <code>text</code>: (default: <code>""</code>) A String representing what the barcode translates to.<br>
      <code>type</code>: (default: <code>'code128'</code>) A String which identifies the format of the barcode.
    </span>
  </p>
</aside>

<div><!-- spacing --></div>

## Checkbox

- Checkbox
    - [Field](#field)

A single checkbox that can be checked or unchecked.

|  Functions                                   |
| -------------------------------------------- |
| [constructor](#checkbox-constructor)          |
| [get value](#checkbox-get-value)              |
| [set value](#checkbox-set-value)              |

### Checkbox.constructor

>Checkbox.constructor(name, value [, config])

```javascript
  const checkbox = new Checkbox("Name", true);
```

Initializes a new Checkbox Field.

<aside class="parameters">
  <p class="title"><span>Parameters</span></p>
  <p class="parameter">
    <span class="name">name</span>
    <span class="type">String</span>
    <span class="description">
      The name of the Field as it is on <a href="https://airtable.com">Airtable.com</a>.
    </span>
  </p>
  <p class="parameter">
    <span class="name">value</span>
    <span class="type">Boolean</span>
    <span class="description">
      A Boolean representing whether or not the checkbox is checked.
    </span>
  </p>
</aside>

<div><!-- spacing --></div>

### Checkbox.get value

>Checkbox.get value()

```javascript
console.log(checkbox.value);
```

> Output:

```
true
```

<aside class="parameters">
  <p class="title"><span>Return Value</span></p>
  <p class="parameter">
    <span class="type">Boolean</span>
    <span class="description">
      A Boolean representing whether or not the checkbox is checked.
    </span>
  </p>
</aside>

<div><!-- spacing --></div>

### Checkbox.set value

>Checkbox.set value(value)

```javascript
checkbox.value = !checkbox.value;
console.log(checkbox.value)
```

>Output:

```
true
```

Used to set the value of this Field. Setting this Field to `null` or `undefined` will result in the Field being set to false.

<aside class="parameters">
  <p class="title"><span>Parameters</span></p>
  <p class="parameter">
    <span class="name">value</span>
    <span class="type">Boolean</span>
    <span class="description">
      A Boolean representing whether or not the checkbox is checked.<br>
      '0' or 0 will be set to false.<br>
      '1' or 1 will be set to true.
    </span>
  </p>
</aside>

<div><!-- spacing --></div>

## Collaborator

- Collaborator
    - [Field](#field)

A collaborator field lets you add collaborators to your records. Collaborators can optionally be notified when they're added by enabling that option through the Airtable website.

|  Functions                                   |
| -------------------------------------------- |
| [constructor](#collaborator-constructor)          |
| [get isMulti](#collaborator-get-ismulti)       |
| [get value](#collaborator-get-value)              |
| [set isMulti](#collaborator-set-ismulti)       |
| [set value](#collaborator-set-value)              |

### Collaborator.constructor

>Collaborator.constructor(name, value [, config])

```javascript
  const users = [
    {
      id: 'lkajsdlfkj1l3k',
      name: 'Bob',
      email: 'bob@email.com'
    },
    {
      id: 'alsdkfj2lk34j5',
      name: 'Susan',
      email: 'susan@email.org'
    }
  ];

  const config = {
    multi: true
  };

  const collaborator = new Collaborator("Name", users, config);
```

Initializes a new Collaborator Field.

<aside class="parameters">
  <p class="title"><span>Parameters</span></p>
  <p class="parameter">
    <span class="name">name</span>
    <span class="type">String</span>
    <span class="description">
      The name of the Field as it is on <a href="https://airtable.com">Airtable.com</a>.
    </span>
  </p>
  <p class="parameter">
    <span class="name">value</span>
    <span class="type">Object</span>
    <span class="description">
      Should be a key-value Object representing an Airtable user.
    </span>
  </p>
  <p class="parameter">
    <span class="name">value</span>
    <span class="type">Array</span>
    <span class="description">
      Should be an Array of key-value Objects representing an Airtable user.
    </span>
  </p>
  <p class="parameter">
    <span class="name">config</span>
    <span class="type">Object</span>
    <span class="optional"></span>
    <span class="description">
      A key-value Object representing the Field Definition.
    </span>
  </p>
</aside>

>Collaborator Object:

```
{
  id: <String> Airtable User ID
  email: <String> User's email
  name: <String> User's full name
}
```

You only need to send an Object containing an Airtable User ID or `email` to add a collaborator. Airtable looks for an `id` and then looks at the `email` if an `id` is not present. Sending a bad `id` and good `email` will fail; sending a good `id` and bad `email` will succeed; sending only an `id` will succeed; sending only an `email` will succeed; sending only a `name` will fail. Airtable does not look at the `name`.

<aside class="parameters">
  <p class="title"><span>Config</span></p>
  <p class="parameter">
    <span class="name">multi</span>
    <span class="type">Boolean</span>
    <span class="description">
      default: <code>false</code><br>
      A Boolean representing whether or not to allow multiple collaborators.
    </span>
  </p>
</aside>

<div><!-- spacing --></div>

### Collaborator.get isMulti

>Collaborator.get isMulti

```javascript
console.log(collaborator.isMulti);
```

>Output:

```
true
```

<aside class="parameters">
  <p class="title"><span>Return Value</span></p>
  <p class="parameter">
    <span class="type">Boolean</span>
    <span class="description">
      A Boolean representing whether or not this field can accept an Array of collaborators.
    </span>
  </p>
</aside>

<div><!-- spacing --></div>

### Collaborator.get value

>Collaborator.get value()

```javascript
console.log(JSON.stringify(collaborator.value, null, 2));
```

> Output:

```json
[
  {
    "id": "lkajsdlfkj1l3k",
    "name": "Bob",
    "email": "bob@email.com"
  },
  {
    "id": "alsdkfj2lk34j5",
    "name": "Susan",
    "email": "susan@email.org"
  }
]
```

<aside class="parameters">
  <p class="title"><span>Return Value</span></p>
  <p class="parameter">
    <span class="type">Object</span>
    <span class="type">Array</span>
    <span class="type">immutable</span>
    <span class="description">
      If the field isMulti, this will return an Array of collaborators, or an empty Array.
      Otherwise, the field will return a collaborator or null.
    </span>
  </p>
</aside>

<div><!-- spacing --></div>

### Collaborator.set isMulti

<aside class="warning">
  This function cannot be used.
</aside>

<div><!-- spacing --></div>

### Collaborator.set value

>Collaborator.set value(value)

```javascript
collaborator.value = collaborator.value.concat({
  id: 'lkajlk32jlkasdf0',
  name: 'Greg',
  email: 'greg@email.net'
});

console.log(JSON.stringify(collaborator.value, null, 2));
```

>Output:

```json
[
  {
    "id": "lkajsdlfkj1l3k",
    "name": "Bob",
    "email": "bob@email.com"
  },
  {
    "id": "alsdkfj2lk34j5",
    "name": "Susan",
    "email": "susan@email.org"
  },
  {
    "id": "lkajlk32jlkasdf0",
    "name": "Greg",
    "email": "greg@email.net"
  }
]
```

Used to set the value of this Field. Setting this Field to `null` or `undefined` will result in the Field being set to false.

<aside class="parameters">
  <p class="title"><span>Parameters</span></p>
  <p class="parameter">
    <span class="name">value</span>
    <span class="type">Object</span>
    <span class="description">
      Should be a key-value Object representing an Airtable user.
    </span>
  </p>
  <p class="parameter">
    <span class="name">value</span>
    <span class="type">Array</span>
    <span class="description">
      Should be an Array of key-value Objects representing an Airtable user.
    </span>
  </p>
</aside>

<div><!-- spacing --></div>

## Count

lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj

## CreatedTime

lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj

## Currency

lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj

## DateField

lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj

## Email

- Email
    - [SingleLineText](#singlelinetext)
        - [Field](#field)

<aside class="notice">
  Although Airtable.com says this field should be a valid email address, it can be any string.
</aside>

A valid email address (eg. andrew@gmail.com).

This field currently just extends SingleLineText and behaves exactly the same. Reference [SingleLineText](#singlelinetext) for more information.

## Formula

lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj

## LinkToAnotherRecord

lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj

## LongText

- LongText
    - [SingleLineText](#singlelinetext)
        - [Field](#field)

A long text field that can span multiple lines.

This field currently just extends SingleLineText and behaves exactly the same. Reference [SingleLineText](#singlelinetext) for more information.

## Lookup

lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj

## MultipleSelect

lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj

## NumberField

lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj

## Percent

lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj

## PhoneNumber

- PhoneNumber
    - [SingleLineText](#singlelinetext)
        - [Field](#field)

<aside class="notice">
  Although Airtable.com says this field should be a telephone number, it can be any string.
</aside>

A telephone number (e.g. (206) 794-6391).

This field currently just extends SingleLineText and behaves exactly the same. Reference [SingleLineText](#singlelinetext) for more information.


## Rating

lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj

## Rollup

lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj

## SingleLineText

lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj

## SingleSelect

lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj

## UnknownField

lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj
lakjsdflkajlsdkjflaksjdflkajsdlfkjalsdkfj

## URL

- URL
    - [SingleLineText](#singlelinetext)
        - [Field](#field)

<aside class="notice">
  Although Airtable.com says this field should be a valid URL, it can be any string.
</aside>

A valid URL (eg. www.google.com or https://www.amazon.com).

This field currently just extends SingleLineText and behaves exactly the same. Reference [SingleLineText](#singlelinetext) for more information.
