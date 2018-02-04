"use strict";
const util = require("util");
const url = require("url");
const IsIp = require("is-ip");
const isbn_1 = require("isbn");
const isColor = require("is-color");
const Types = [
    "string",
    "number",
    "boolean",
    "object",
    "array",
    "email",
    "url",
    "date",
    "time",
    "color",
    "ipv4",
    "ipv6",
    "mac",
    "uuid",
    "isbn",
    "ascii",
    "base64",
    "json",
    "data-uri",
];
const RE = {
    email: /\S+@(\S+\.\S+|localhost)/i,
    url: /([a-z]+\:\/\/|\/\/)(\S+\.\S+|localhost)[\/\?\S]*/i,
    mac: [
        /[0-9a-f]{2}-[0-9a-f]{2}-[0-9a-f]{2}-[0-9a-f]{2}-[0-9a-f]{2}-[0-9a-f]{2}/i,
        /[0-9a-f]{2}:[0-9a-f]{2}:[0-9a-f]{2}:[0-9a-f]{2}:[0-9a-f]{2}:[0-9a-f]{2}/i
    ],
    uuid: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    base64: /[A-Za-z0-9\+\/]+[=]{0,2}/,
    dataURI: [
        /data:[a-z0-9]+\/[A-Za-z0-9\-];[A-Za-z0-9\-\=]+;base64,[A-Za-z0-9\+\/]+[=]{0,2}/,
        /data:[a-z0-9]+\/[A-Za-z0-9\-];base64,[A-Za-z0-9\+\/]+[=]{0,2}/,
        /data:[a-z0-9]+\/[A-Za-z0-9\-];[A-Za-z0-9\-\=]+,\S+/,
        /data:;base64,[A-Za-z0-9\+\/]+[=]{0,2}/,
        /data:[a-z0-9]+\/[A-Za-z0-9\-],\S+/,
        /data:,\S+/
    ],
    hexColor: [
        /#[a-f0-9]{6}|#[a-f0-9]{3}/i,
        /#[a-f0-9]{8}|#[a-f0-9]{6}|#[a-f0-9]{3}/i
    ]
};
const TypeMsg = {
    number: "'%s' must be a valid number or numeric string.",
    object: "'%s' must be a valid object.",
    array: "'%s' must be an instance of Array.",
    email: "'%s' must be a valid email address.",
    url: "'%s' must be a valid URL address.",
    date: "'%s' must be an instance of Date or a valid date string.",
    time: "'%s' must be a valid UNIX timestamp or a valid time string.",
    color: "'%s' must be a valid color name, a hex, rgb or rgba color string.",
    ipv4: [
        "'%s' must be a valid IPv4 address.",
        "'%s' must be a valid, non-private and non-reserved IPv4 address.",
    ],
    ipv6: "'%s' must be a valid IPv6 address.",
    mac: "'%s' must be a valid MAC address.",
    uuid: "'%s' must be a valid UUID.",
    isbn: "'%s' must be a valid ISBN.",
    ascii: "'%s' must be a valid ASCII string.",
    base64: "'%s' must be a valid base64 string.",
    json: "'%s' must be a valid JSON.",
    dataURI: "'%s' must be a valid Data URI string.",
};
function parseRule(rules, prefix = "") {
    var _rules = {};
    for (let k in rules) {
        let rule;
        if (typeof rules[k] === "string")
            rule = { type: rules[k] };
        else
            rule = rules[k];
        if (typeof rule.msg === "string") {
            let msg = rule.msg;
            rule.msg = {
                type: msg,
                required: msg,
                equals: msg,
            };
            if (rule.length)
                rule.msg.length = msg;
            else if (rule.range)
                rule.msg.range = msg;
        }
        else if (typeof rule.msg !== "object") {
            rule.msg = {};
        }
        if (rule.type == "object" && rule.children)
            rule.children = parseRule(rule.children, `${prefix}${k}.children.`);
        if (!Types.includes(rule.type)) {
            throw new TypeError(`The type '${rule.type}' of '${prefix}${k}' you specified is invalid.`);
        }
        else if (rule.equals && (!rules[rule.equals] || !rules[rule.equals].required)) {
            throw new ReferenceError(`The comparing fields '${prefix}${rule.equals}' must be defined and required.`);
        }
        else {
            _rules[k] = rule;
        }
    }
    return _rules;
}
function filter(rules, data) {
    var _data = {};
    for (let k in data) {
        if (k in rules) {
            if (typeof rules[k] === "object" && rules[k].type == "object")
                _data[k] = filter(rules[k].children, data[k]);
            else
                _data[k] = data[k];
        }
    }
    return _data;
}
function validate(rules, data, prefix = "") {
    var strings = ["string", "email", "url", "ascii", "base64", "json"];
    for (let k in rules) {
        let rule = rules[k];
        let matches;
        let msg;
        let throwTypeError = (msg) => {
            msg = rule.msg.type || msg;
            throw new TypeError(util.format(msg, prefix + k));
        };
        // Deal with undefined and null values.
        if (data[k] === undefined || data[k] === null) {
            if (rule.required)
                throw new Error(util.format(rule.msg.required || "'%s' must be provided.", prefix + k));
            else
                continue;
        }
        // Check data type.
        switch (rule.type) {
            case "string":
                checkBasicType(rule, data[k], prefix + k);
                break;
            case "number":
                if (rule.strict || rule.strict === undefined) {
                    checkBasicType(rule, data[k], prefix + k);
                }
                else if (isNaN(data[k])) {
                    throwTypeError(TypeMsg.number);
                }
                break;
            case "boolean":
                checkBasicType(rule, data[k], prefix + k);
            case "object":
                if (typeof data[k] != "object" || data[k] === null) {
                    throwTypeError(TypeMsg.object);
                }
                break;
            case "array":
                if (!(data[k] instanceof Array)) {
                    throwTypeError(TypeMsg.array);
                }
                break;
            case "email":
                matches = data[k].match(RE.email);
                if (!matches || matches[0].length !== data[k].length
                    || (rule.strict
                        && (matches[1].toLowerCase() == "localhost"
                            || byteLength(data[k]) != data[k].length))) {
                    throwTypeError(TypeMsg.email);
                }
                break;
            case "url":
                matches = data[k].match(RE.url);
                if (!matches || matches[0].length !== data[k].length) {
                    throwTypeError(TypeMsg.url);
                }
                else if (rule.strict) {
                    // Check URL in strict mode.
                    let start = data[k].substring(0, 2);
                    let urlStr = start === "//" ? `http:${data[k]}` : data[k];
                    let urlObj = url.parse(urlStr);
                    if (urlObj.hostname == "localhost"
                        || (urlObj.href != urlStr
                            && urlObj.href != urlStr + "/")) {
                        throwTypeError(TypeMsg.url);
                    }
                }
                break;
            case "date":
                if (!(data[k] instanceof Date) && (typeof data[k] != "string"
                    || isNaN(Date.parse(data[k])))) {
                    throwTypeError(TypeMsg.date);
                }
                break;
            case "time":
                if ((typeof data[k] == "number"
                    && new Date(data[k]).toString() == "Invalid Date")
                    && isNaN(Date.parse(data[k]))) {
                    throwTypeError(TypeMsg.time);
                }
                break;
            case "color":
                if (!isColor(data[k])) {
                    throwTypeError(TypeMsg.color);
                }
                break;
            case "ipv4":
                if (!IsIp.v4(data[k])) {
                    throwTypeError(TypeMsg.ipv4[0]);
                }
                else if (rule.strict) {
                    // Check IPv4 address in strict mode.
                    let parts = data[k].split(".").map(v => parseInt(v));
                    if (parts[0] == 0 || parts[0] == 10 || parts[0] == 127 || parts[0] > 223
                        || (parts[0] == 172 && parts[1] >= 16 && parts[1] <= 31)
                        || (parts[0] == 192 && parts[1] == 168)) {
                        throwTypeError(TypeMsg.ipv4[1]);
                    }
                }
                break;
            case "ipv6":
                if (!IsIp.v6(data[k])) {
                    throwTypeError(TypeMsg.ipv6);
                }
                break;
            case "mac":
                matches = data[k].match(RE.mac[0]) || data[k].match(RE.mac[1]);
                if (!matches || matches[0].length != data[k].length) {
                    throwTypeError(TypeMsg.mac);
                }
                break;
            case "uuid":
                matches = data[k].match(RE.uuid);
                if (!matches || matches[0].length != data[k].length) {
                    throwTypeError(TypeMsg.uuid);
                }
                break;
            case "isbn":
                let isbn = isbn_1.ISBN.parse(data[k]);
                if (!isbn || (rule.strict && isbn.codes.isbn10h != data[k]
                    && isbn.codes.isbn13h != data[k])) {
                    throwTypeError(TypeMsg.isbn);
                }
                break;
            case "ascii":
                if (byteLength(data[k]) != data[k].length)
                    throwTypeError(TypeMsg.ascii);
                break;
            case "base64":
                matches = data[k].match(RE.base64);
                if (!matches || matches[0].length != data[k].length)
                    throwTypeError(TypeMsg.base64);
                break;
            case "json":
                try {
                    JSON.parse(data[k]);
                }
                catch (e) {
                    throwTypeError(TypeMsg.json);
                }
                break;
            case "data-uri":
                matches = data[k].match(RE.dataURI[0])
                    || data[k].match(RE.dataURI[1])
                    || data[k].match(RE.dataURI[2])
                    || data[k].match(RE.dataURI[3])
                    || data[k].match(RE.dataURI[4])
                    || data[k].match(RE.dataURI[5]);
                if (!matches || matches[0].length != data[k].length)
                    throwTypeError(TypeMsg.dataURI);
                break;
        }
        // Check equivalents.
        if (rule.equals && rule[rule.equals]) {
            if (data[k] != data[rule.equals]) {
                msg = "The value of '%s' must be the same as '%s'.";
                msg = rule.msg.equals || msg;
                msg = util.format(msg, prefix + k, prefix + rule.equals);
                throw new Error(msg);
            }
        }
        if ((rule.type === "array" || strings.includes(rule.type)) && rule.length) {
            let isArray = rule.type === "array";
            let word = isArray ? "element" : "character";
            let words = isArray ? "elements" : "characters";
            let msg1 = `'%s' must carry at least %d and no more than %d ${words}.`;
            let msg2 = "'%s' must carry %d " + (rule.length === 1 ? word : words);
            // Check string/array length.
            if (rule.length instanceof Array) {
                let min = rule.length[0], max = rule.length[1];
                if (data[k].length < min || data[k].length > max) {
                    msg = rule.msg.length || msg1;
                    throw new Error(util.format(msg, prefix + k, min, max));
                }
            }
            else if (data[k].length != rule.length) {
                msg = rule.msg.length || msg2;
                throw new Error(util.format(msg, prefix + k, rule.length));
            }
        }
        else if (rule.type == "number" && rule.range) {
            // Check number range.
            if (rule.range instanceof Array) {
                let min = rule.range[0], max = rule.range[1];
                msg = "The value of '%s' must between %d and %d.";
                if (data[k] < min || data[k] > max) {
                    msg = rule.msg.range || msg;
                    throw new RangeError(util.format(msg, prefix + k, min, max));
                }
            }
        }
        else if (typeof data[k] == "object") {
            // Walk object.
            validate(rule.children, data[k], `${prefix}${k}.`);
        }
    }
    return true;
}
function checkBasicType(rule, value, prefix) {
    var types = ["string", "number", "boolean"];
    if (types.includes(rule.type) && typeof value != rule.type) {
        let msg = rule.msg.type || `'%s' must be a valid ${rule.type}.`;
        throw new TypeError(util.format(msg, prefix));
    }
}
function byteLength(str) {
    if (typeof Buffer == "function" && Buffer.byteLength instanceof Function)
        return Buffer.byteLength(str);
    var b = 0, l = str.length;
    if (l) {
        for (let i = 0; i < l; i++) {
            if (str.charCodeAt(i) > 255) {
                b += 3;
            }
            else {
                b++;
            }
        }
        return b;
    }
    else {
        return 0;
    }
}
/**
 * Simple Friendly Node.js Validator.
 */
class Validator {
    /**
     * Creates a validator with specified rules.
     */
    constructor(rules) {
        if (rules)
            this.set(rules);
    }
    /** (**deprecated**) Sets the validating rules. */
    set(rules) {
        return this.rules = parseRule(rules);
    }
    /** Filters input data according to the rules. */
    filter(data) {
        return filter(this.rules, data);
    }
    /** Checks if the input data are all valid. */
    validate(data) {
        return validate(this.rules, data);
    }
    /** An alias of validate().  */
    check(data) {
        return this.validate(data);
    }
}
module.exports = Validator;
