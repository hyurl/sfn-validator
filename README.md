# SFN-Validator

**Simple Friendly Node.js Validator.**

## Install

```sh
npm install sfn-validator --save
```

## Environment

This package supports any version of Node.js that higher than 4.0.0.

## Example

```javascript
const Validator = require("sfn-validator");

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
    url: "url" // Short-hand, equal to {type: "url"}.
});

try{
    validator.validate(data);
}catch(e){
    console.log(e);
}
```

## API

- `new Validator(rules: any)` Creates a validator with specified rules.
- `validator.validate(data: any)` Checks if the input data are all 
    valid.
    - alias: `validator.check()`
- `validator.filter(data: any): any` Filters input data according to 
    the rules.

## Rules

Every field of rule can be defined with these properties:

- `type` The data type to check, could be:
    - `string`
    - `number`
    - `boolean`
    - `object` Carries children fields.
    - `array`
    - `email`
    - `url`
    - `date` Date instance or a valid date string.
    - `time` Unix timestamp or time string.
    - `color` Color name, hex, RGB, RGBA color string.
    - `ipv4`
    - `ipv6`
    - `mac` Media Access Control address (Machine address).
    - `uuid` Universal Unique Identifier. 
    - `isbn` International Standard Book Number.
    - `ascii` Only contains ASCII characters.
    - `base64` Only contains base64 characters.
    - `json`
    - `data-uri`
- `required` Whether the field is required (`true`) or not (`false`, default).
- `equals` The value of this field should be equal to the given field's.
- `msg` Customize error messages, could be a string that sets all messages,
    or an object sets messages for `type`, `required` and `equals`. If the 
    field has a `length` or `range` property, their error messages could be 
    set as well.
- `length` Only for `string`, `email`, `url`, `ascii`, `base64`, `json`, 
    `data-uri` and `array`, could be a number sets an exact length, or an 
    array sets the minimum and maximum length.
- `range` Only for `number`, an array set the range (minimum and maximum) of 
    the data value.
- `strict` Strict mode, only for `number`, `boolean`, `email`, `url`, `ipv4`, 
    `isbn`, it's `false` by default for most types except `number`, which is 
    `true` by default.
- `children` Only for `object`, to set children rules.

## More Details About Strict Mode

- `number` When non-strict, treat numeric string as number.
- `email` If strict, the email address can only contain ASCII characters, and 
    the hostname must not be `localhost`.
- `url` If strict, the hostname can only contain ASCII characters, and the 
    hostname must not be `localhost`.
- `ipv4` If strict, reject private and reserved IP addresses.
- `isbn` If strict, the book number must be prettified with hyphenates (`-`).

## Pre-check of rule Definition

When you call `new Validator()` and pass the rules, the program will perform 
checking on the rules you provided, if any of them is invalid, an error will 
be thrown and tells you where is incorrect in your rules, so that you can find 
and fix it as soon as possible.

## What Will Happen If Validating Failed?

If validating failed, `validator.validate()` will thrown an error message.
You can catch the error with a `try...catch...` block. This package will 
modify the initial error stack and only shows you the useful parts, so it's 
very friendly on user-experience.

## About Children Rule

If you specify a field's type `object`, then this field can and must carry 
children fields, like this example:

```javascript
var rules = {
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

Children rules can be nested and unlimited, **BUT**, if you use `equals` 
property, be aware that it can only refers to the same depth of the rule.