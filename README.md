# SFN-Validator

**Simple Friendly Node.js Validator.**

## Install

```sh
npm install sfn-validator --save
```

## Import

```javascript
const Validator = require("sfn-validator");
```

## Example

```javascript
var validator = new Validator({
    name: {
        type: "string",
        required: true,
        length: [3, 18]
    },
    email: {
        type: "email",
        required: true,
        strict: true,
    },
    password: {
        type: "string",
        required: true,
        length: [8, 18],
        msg: {
            required: "You must provide a `%s` in this form.",
            equals: "The length of the `%s` should between %d and %d.",
        }
    },
    check_password: {
        type: "string",
        required: true,
        equals: "password",
    },
    url: "url" // Short-hand, equals to {type: "url"}.
});

try{
    validator.check(data);
}catch(e){
    console.log(e);
}
```

## API

- `new Validator([rule: object])` Creates a validator with a specified rule.
- `validator.set(rule: object): object` Sets the validating rule.
- `validator.check(data: object): object` Checks if the input data are all 
    valid.
- `validator.filter(data: object): boolean` Filters input data according to 
    the validating rule.

## Rules

Every field can be defined with these key-value pairs:

- `type` The data type to test, could be:
    - `string`
    - `number`
    - `boolean`
    - `object` Has children fields.
    - `array`
    - `email`
    - `url`
    - `date`
    - `time` Unix timestamp or time string.
    - `color` Color name, hex, RGB, RGBA color string.
    - `ipv4`
    - `ipv6`
    - `mac` Media Access Control address.
    - `uuid` Universal Unique Identifier. 
    - `isbn` International Standard Book Number.
    - `ascii` Only contains ASCII characters.
    - `base64` Only contains base64 characters.
    - `json`
    - `data-uri`
- `required` Whether the field is required (`true`) or not (`false`, default).
- `equals` The value of this field should equals to the given field.
- `msg` Customize the error message, could be a string that sets all messages,
    or an object sets messages for `type`, `required` and `equals`. If the 
    field has a `length` or `range` property, their error message could be 
    set as well.
- `length` Only for `string`, `email`, `url`, `ascii`, `base64`, `json` and 
    `array`, could be a number sets an exactly length, or an array sets the 
    minimum and maximum length.
- `range` Only for `number`, an array set the range of the data value.
- `strict` Strict mode, only for `number`, `email`, `url`, `color`, `ipv4`, 
    `isbn`, its `false` by default for most types except `number`, which is 
    `true` by default.

## More Details About Strict Mode

- `number` When non-strict, treat numeric string as number.
- `email` If strict, the email address can only contain ASCII characters, and 
    the hostname must not be `localhost`.
- `url` If strict, the hostname can only contain ASCII characters, and must 
    not be `localhost`.
- `color` When non-strict, hex-color like `#FFFFFFFF` with **8 hex numbers** 
    is valid.
- `ipv4` If strict, reject private and reserved IP addresses.
- `isbn` If strict, the book number must be prettified.

## What Will Happen If Validating Failed?

If validating succeeded, `validator.check()` will return `true`. But if 
failed, instead of returning `false`, the validator thrown an error message.
You can catch the error with a `try...catch...` block, and you can customize 
the error message by setting the `msg` property.

## About Children Rule

If you specify a field's type `object`, then this field can and must carry 
children fields, like this example:

```javascript
var rule = {
    multi: {
        type: "object",
        children: {
            name: "string",
            email: "email"
        }
    }
};
// And input data should like this:
var data = {
    multi: {
        name: "John",
        email: "john@example.com"
    }
};
```

Children rule can be nested and unlimited, **BUT**, if you use `equals` 
property, be aware that it can only refers to the same depth of the rule.