import * as util from "util";
import * as url from "url";
import IsIp = require("is-ip");
import { ISBN } from "isbn";
import isColor = require("is-color");
import { Rule, Message, ValidTypes } from ".";

const Strings = [
    "string",
    "email", // can be strict.
    "url", // can be strict.
    "ascii",
    "base64",
    "json",
    "data-uri"
];

const Types = Strings.concat([
    "number", // Strict by default, non-strict means numeric string also treated as number.
    "boolean",
    "object", // carries children rules.
    "array",
    "date",
    "time",
    "color", // can be strict.
    "ipv4", // can be strict.
    "ipv6",
    "mac",
    "uuid",
    "isbn" // can be strict.
]);

/** These types can be set `strict`. */
const Stricts = [
    "boolean",
    "email",
    "url",
    "ipv4",
    "isbn"
];

const RE = {
    email: /^\S+@(\S+\.\S+|localhost)$/i,
    url: /^([a-z]+\:\/\/|\/\/)(\S+\.\S+|localhost)[\/\?\S]*$/i,
    mac: [
        /^[0-9a-f]{2}-[0-9a-f]{2}-[0-9a-f]{2}-[0-9a-f]{2}-[0-9a-f]{2}-[0-9a-f]{2}$/i,
        /^[0-9a-f]{2}:[0-9a-f]{2}:[0-9a-f]{2}:[0-9a-f]{2}:[0-9a-f]{2}:[0-9a-f]{2}$/i
    ],
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    base64: /^[A-Za-z0-9\+\/]+[=]{0,2}$/,
    dataURI: [
        /^data:[a-z0-9]+\/[A-Za-z0-9\-\+\.;=]+;base64,[A-Za-z0-9\+\/]*[=]{0,2}$/,
        /^data:[a-z0-9]+\/[A-Za-z0-9\-\+\.;=]+,\S+$/i,
        /^data:;base64,[A-Za-z0-9\+\/]*[=]{0,2}$/,
        /^data:,\S*$/
    ]
};

const TypeMsg = {
    number: [
        "'%s' must be a valid number.",
        "'%s' must be a valid number or a numeric string.",
    ],
    boolean: "'%s' must be a valid boolean value.",
    array: "'%s' must be an instance of Array.",
    email: "'%s' must be a valid email address.",
    url: "'%s' must be a valid URL address.",
    date: "'%s' must be an instance of Date or a valid date string.",
    time: "'%s' must be a valid UNIX timestamp or time string.",
    color: "'%s' must be a valid color name, a hex, RGB or RGBA color string.",
    ipv4: [
        "'%s' must be a valid IPv4 address.",
        "'%s' must be a valid, non-private and non-reserved IPv4 address.",
    ],
    ipv6: "'%s' must be a valid IPv6 address.",
    mac: "'%s' must be a valid MAC address.",
    uuid: "'%s' must be a valid UUID string.",
    isbn: "'%s' must be a valid ISBN string.",
    ascii: "'%s' must be a valid ASCII string.",
    base64: "'%s' must be a valid base64 string.",
    json: "'%s' must be a valid JSON string.",
    "data-uri": "'%s' must be a valid Data URI string.",
}

/** Parses the given rules into a more proper format. */
export function parseRule(rules: { [field: string]: ValidTypes | Rule }, prefix = "") {
    var _rules: { [field: string]: Rule } = {};

    for (let field in rules) {
        /** Prefixed field name. */
        let _field = prefix + field;
        /** Prefixed field name with 'children.' scope. */
        let __field = (prefix ? prefix + "children." : "") + field;
        let rule: Rule;

        if (typeof rules[field] === "string")
            rule = { type: <ValidTypes>rules[field] };
        else
            rule = <Rule>rules[field];

        // pre-check type
        if (Types.indexOf(rule.type) === -1)
            throw new TypeError(`type '${rule.type}' of '${__field}' is invalid.`);

        // pre-check equality requirements.
        if (rule.equals && (!rules[rule.equals]
            || (<Rule>rules[rule.equals]).required == false
            || (<Rule>rules[rule.equals]).type != rule.type)) {
            let name = (prefix ? prefix + "children." : "") + rule.equals;
            throw new ReferenceError(`comparing field '${name}' must be defined with type '${rule.type}' and is required.`);
        }

        // handle error message.
        if (typeof rule.msg === "string") {
            let msg: string = rule.msg;

            rule.msg = {
                type: msg,
                required: msg,
                equals: msg,
            };

            if (rule.length)
                rule.msg.length = msg;
            else if (rule.range)
                rule.msg.range = msg;

        } else if (typeof rule.msg != "object" && rule.msg !== undefined) {
            throw new TypeError(`'${__field}.msg' must be a string or an object.`);
        } else {
            rule.msg = rule.msg || {};
            rule.required = rule.required || false;

            if (rule.strict === undefined) {
                if (rule.type == "number")
                    rule.strict = true;
                else if (Stricts.indexOf(rule.type) !== -1)
                    rule.strict = false;
            }

            // type error
            if (!rule.msg.type) {
                if (rule.type == "ipv4") {
                    rule.msg.type = util.format(rule.strict ? TypeMsg.ipv4[1] : TypeMsg.ipv4[0], _field);
                } else if (rule.type == "number") {
                    rule.msg.type = util.format(rule.strict ? TypeMsg.number[0] : TypeMsg.number[1], _field);
                } else {
                    rule.msg.type = util.format(TypeMsg[rule.type] || `'%s' must be a valid ${rule.type}.`, _field);
                }
            }

            // require error
            if (rule.required && !rule.msg.required)
                rule.msg.required = `'${_field}' must be provided.`;

            // equality error
            if (rule.equals && !rule.msg.equals)
                rule.msg.equals = `The value of '${_field}' must be the same as '${prefix + rule.equals}'.`;

            // length error
            if (rule.length && !rule.msg.length) {
                let single = rule.type == "array" ? "element" : "character",
                    plural = rule.type == "array" ? "elements" : "characters";

                if (rule.length instanceof Array) {
                    let min = rule.length[0],
                        max = rule.length[1];

                    rule.msg.length = `'${_field}' must contain at least ${min} and at most ${max} ${plural}.`;
                } else {
                    rule.msg.length = `'${_field}' must contain ${rule.length} ` + (rule.length === 1 ? single : plural) + ".";
                }
            }

            // range error
            if (rule.range && !rule.msg.range) {
                if (rule.range instanceof Array) {
                    let min = rule.range[0],
                        max = rule.range[1];

                    rule.msg.range = `The value of '${_field}' must between ${min} and ${max}.`;
                } else {
                    throw new TypeError(`'${__field}' must be an array that contains only 2 numbers.`);
                }
            }
        }

        // recursively parse rules.
        if (rule.type == "object") {
            if (typeof rule.children == "object" && rule.children) {
                rule.children = parseRule(rule.children, `${_field}.`);
            } else {
                throw new TypeError(`'${__field}' must contain children rules.`);
            }
        }

        _rules[field] = rule;
    }

    return _rules;
}

export function filter(rules: { [field: string]: Rule }, data: any): any {
    var _data = {};

    for (let field in data) {
        if (field in rules) {
            if (rules[field].type == "object") {
                // recursively filter children nodes.
                _data[field] = filter(<any>rules[field].children, data[field]);
            } else {
                _data[field] = data[field];
            }
        }
    }

    return _data;
}

export function validate(rules: { [field: string]: Rule }, data: object) {
    for (let field in rules) {
        let rule: Rule = rules[field],
            value = data[field],
            matches: RegExpMatchArray = null,
            throwTypeError = () => {
                throw new TypeError((<Message>rule.msg).type);
            };

        // Deal with undefined and null values.
        if (value === undefined || value === null) {
            if (rule.required)
                throw new Error((<Message>rule.msg).required);
            else
                continue;
        }

        // Check data type.
        switch (rule.type) {

            case "string":
                if (typeof value != "string")
                    throwTypeError();

                break;

            case "number":
                if ((rule.strict && typeof value != "number") || isNaN(value))
                    throwTypeError();

                break;

            case "boolean":
                if (typeof value != "boolean"
                    && (rule.strict || (value !== 1 && value !== 0))) {
                    throwTypeError();
                }

                break;

            case "object":
                if (typeof value != "object" || value === null)
                    throwTypeError();

                break;

            case "array":
                if (!(value instanceof Array))
                    throwTypeError();

                break;

            case "email":
                matches = value.match(RE.email);

                if (!matches
                    || (rule.strict && (matches[1].toLowerCase() == "localhost"
                        || Buffer.byteLength(value) != value.length))) {
                    throwTypeError();
                }
                break;

            case "url":
                matches = value.match(RE.url);

                if (!matches) {
                    throwTypeError();
                } else if (rule.strict) {
                    // Check URL in strict mode.
                    let start = value.substring(0, 2);
                    let urlStr = start === "//" ? `http:${value}` : value;
                    let urlObj = url.parse(urlStr);

                    if (urlObj.hostname == "localhost" || (urlObj.href != urlStr
                        && urlObj.href != urlStr + "/")) {
                        throwTypeError();
                    }
                }
                break;

            case "date":
                if (!(value instanceof Date) && (typeof value != "string"
                    || isNaN(Date.parse(value)))) {
                    throwTypeError();
                }
                break;

            case "time":
                if ((typeof value != "number" && typeof value != "string")
                    || new Date(<any>value).toString() == "Invalid Date") {
                    throwTypeError();
                }

                break;

            case "color":
                if (isColor.isRgb(value) || isColor.isRgba(value)) {
                    matches = (<string>value).match(/\d+/g);

                    let alpha = parseFloat(matches[3]);
                    let parts = matches.slice(0, 3);

                    if (!isNaN(alpha) && (alpha < 0 || alpha > 1)) {
                        throwTypeError();
                    } else {
                        for (let part of parts) {
                            let num = parseInt(part);
                            if (num < 0 || num > 255) {
                                throwTypeError();
                            }
                        }
                    }
                } else if (!isColor(value)) {
                    throwTypeError();
                }

                break;

            case "ipv4":
                if (!IsIp.v4(value)) {
                    throwTypeError();
                } else if (rule.strict) {
                    // Check IPv4 address in strict mode.
                    let parts: number[] = value.split(".").map(v => parseInt(v));

                    if (parts[0] == 0 || parts[0] == 10 || parts[0] == 127 || parts[0] > 223
                        || (parts[0] == 172 && parts[1] >= 16 && parts[1] <= 31)
                        || (parts[0] == 192 && parts[1] == 168)) {
                        throwTypeError();
                    }
                }
                break;

            case "ipv6":
                if (!IsIp.v6(value))
                    throwTypeError();

                break;

            case "mac":
                if (!RE.mac[0].test(value) && !RE.mac[1].test(value))
                    throwTypeError();

                break;

            case "uuid":
                if (!RE.uuid.test(value))
                    throwTypeError();

                break;

            case "isbn":
                let isbn = ISBN.parse(value);

                if (!isbn || (rule.strict && isbn.codes.isbn10h != value
                    && isbn.codes.isbn13h != value)) {
                    throwTypeError();
                }
                break;

            case "ascii":
                if (typeof value != "string" || value.match(/[^\x00-\x7F]/)) {
                    throwTypeError();
                }

                break;

            case "base64":
                if (typeof value != "string" || !RE.base64.test(value))
                    throwTypeError();

                break;

            case "json":
                if (typeof value != "string")
                    throwTypeError();

                try {
                    JSON.parse(value);
                } catch (e) {
                    throwTypeError();
                }

                break;

            case "data-uri":
                if (typeof value != "string"
                    || (!RE.dataURI[0].test(value)
                        && !RE.dataURI[1].test(value)
                        && !RE.dataURI[2].test(value)
                        && !RE.dataURI[3].test(value))) {
                    throwTypeError();
                }

                break;
        }

        // Check equality.
        if (rule.equals) {
            if (value != data[rule.equals]) {
                throw new Error((<Message>rule.msg).equals);
            }
        }

        if (rule.length && (rule.type === "array" || Strings.indexOf(rule.type) !== -1)) {
            // Check string and array length.
            if (rule.length instanceof Array) {
                if (value.length < rule.length[0] || value.length > rule.length[1]) {
                    throw new RangeError((<Message>rule.msg).length);
                }
            } else if (value.length != rule.length) {
                throw new Error((<Message>rule.msg).length);
            }
        } else if (rule.type == "number" && rule.range) {
            // Check number range.
            if (value < rule.range[0] || value > rule.range[1]) {
                throw new RangeError((<Message>rule.msg).range);
            }
        } else if (typeof value == "object") {
            // Walk object.
            validate(<any>rule.children, value);
        }
    }
}

export function replaceError(err: Error, func: string): Error {
    let stacks = err.stack.split("\n"),
        _stacks: string[] = [],
        started = false;

    for (let i in stacks) {
        if (started || i == "0") {
            if (_stacks.length == 1) { // only contain the message part.
                _stacks.push(stacks[i].replace(/at.*\(/, () => {
                    return "at " + func + " (";
                }));
            } else {
                _stacks.push(stacks[i]);
            }
        } else if (stacks[i].indexOf("at " + func + " (") !== -1) {
            started = true;
        }
    }

    err.stack = _stacks.join("\n");

    return err;
}