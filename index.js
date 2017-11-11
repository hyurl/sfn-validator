const util = require("util");
const url = require("url");
const IsIp = require("is-ip");
const { ISBN } = require("isbn");
const ColorName = require("color-name");
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
const Types = [
    "string",
    "number", // Strict by default, non-strict means numeric string also treated as number.
    "boolean",
    "object",
    "array",
    "email", // Can be strict.
    "url", // Can be strict.
    "date",
    "time",
    "color", // Can be strict.
    "ipv4", // Can be strict.
    "ipv6",
    "mac",
    "uuid",
    "isbn", // Can be strict.
    "ascii",
    "base64",
    "json",
    "data-uri",
];
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
}

function setRule(rule, prefix = "") {
    var _rule = {};
    for (let k in rule) {
        if (typeof rule[k] === "string")
            rule[k] = { type: rule[k] };
        if (typeof rule[k].msg === "string") {
            var msg = rule[k].msg;
            rule[k].msg = {
                type: msg,
                required: msg,
                equals: msg,
            };
            if (rule[k].length)
                rule[k].msg.length = msg;
            else if (rule[k].range)
                rule[k].msg.range = msg;
        } else if (typeof rule[k].msg !== "object") {
            rule[k].msg = {};
        }
        if (rule[k].type == "object" && rule[k].children)
            rule[k].children = setRule(rule[k].children, `${prefix}${k}.children.`);
        if (!Types.includes(rule[k].type))
            throw new TypeError(`The type ('${rule[k].type}') of '${prefix}${k}' you specified is invalid.`);
        else if (rule[k].equals && (!rule[rule[k].equals] || !rule[rule[k].equals].required))
            throw new ReferenceError(`The comparing fields '${prefix}${rule[k].equals}' must be defined and required.`);
        else
            _rule[k] = rule[k];
    }
    return _rule;
}

function filter(rule, data) {
    var _data = {};
    for (let k in data) {
        if (k in rule) {
            if (rule[k].type == "object")
                _data[k] = filter(rule[k].children, data[k]);
            else
                _data[k] = data[k];
        }
    }
    return _data;
}

function validate(rule, data, prefix = "") {
    var strings = ["string", "email", "url", "ascii", "base64", "json"],
        match = null;
    for (let k in rule) {
        // Deal with undefined and null values.
        if (data[k] === undefined || data[k] === null) {
            if (rule[k].required)
                throw new Error(util.format(rule[k].msg.required || "'%s' must be provided.", prefix + k));
            else
                continue;
        }
        // Check data type.
        switch (rule[k].type) {
            case "string":
                checkBasicType(rule, data, k, "string", prefix);
                break;
            case "number":
                if (rule[k].strict || rule[k].strict === undefined)
                    checkBasicType(rule, data, k, "number", prefix);
                else if (isNaN(data[k]))
                    throw new TypeError(util.format(rule[k].msg.type || TypeMsg.number, prefix + k))
                break;
            case "boolean":
                checkBasicType(rule, data, k, "boolean", prefix);
            case "object":
                if (typeof data[k] != "object" || data[k] === null)
                    throw new TypeError(util.format(rule[k].msg.type || TypeMsg.object, prefix + k));
                break;
            case "array":
                if (!(data[k] instanceof Array))
                    throw new TypeError(util.format(rule[k].msg.type || TypeMsg.array, prefix + k));
                break;
            case "email":
                match = data[k].match(RE.email);
                if (!match || match[0].length !== data[k].length)
                    throw new TypeError(util.format(rule[k].msg.type || TypeMsg.email, prefix + k));
                else if (rule[k].strict && (match[1].toLowerCase() == "localhost" || byteLength(data[k]) != data[k].length))
                    throw new TypeError(util.format(rule[k].msg.type || TypeMsg.email, prefix + k));
                break;
            case "url":
                match = data[k].match(RE.url);
                if (!match || match[0].length !== data[k].length) {
                    throw new TypeError(util.format(rule[k].msg.type || TypeMsg.url, prefix + k));
                } else if (rule[k].strict) {
                    // Check URL in strict mode.
                    var urlStr = data[k][0] == "/" ? "http:" + data[k] : data[k],
                        _url = url.parse(urlStr),
                        _urlLength = byteLength(_url.href),
                        urlStrLength = byteLength(urlStr);
                    if (_url.hostname == "localhost" || (_urlLength != urlStrLength && _urlLength != urlStrLength + 1))
                        throw new TypeError(util.format(rule[k].msg.type || TypeMsg.url, prefix + k));
                }
                break;
            case "date":
                if (!(data[k] instanceof Date) && (typeof data[k] != "string" || isNaN(Date.parse(data[k]))))
                    throw new TypeError(util.format(rule[k].msg.type || TypeMsg.date, prefix + k));
                break;
            case "time":
                if ((typeof data[k] == "number" && new Date(data[k]).toString() == "Invalid Date") && isNaN(Date.parse(data[k])))
                    throw new TypeError(util.format(rule[k].msg.type || TypeMsg.time, prefix + k));
                break;
            case "color":
                if (!ColorName[data[k]] && !checkHexColor(data[k], rule[k].strict) && !checkRgbColor(data[k]))
                    throw new TypeError(util.format(rule[k].msg.type || TypeMsg.color, prefix + k));
                break;
            case "ipv4":
                if (!IsIp.v4(data[k]))
                    throw new TypeError(util.format(rule[k].msg.type || TypeMsg.ipv4[0], prefix + k));
                else if (rule[k].strict) {
                    // Check IPv4 address in strict mode.
                    var parts = data[k].split(".").map(v => parseInt(v));
                    if (parts[0] == 0 || parts[0] == 10 || parts[0] == 127 || parts[0] > 223 ||
                        (parts[0] == 172 && parts[1] >= 16 && parts[1] <= 31) ||
                        (parts[0] == 192 && parts[1] == 168))
                        throw new TypeError(util.format(rule[k].msg.type || TypeMsg.ipv4[1], prefix + k));
                }
                break;
            case "ipv6":
                if (!IsIp.v6(data[k]))
                    throw new TypeError(url.format(rule[k].msg.type || TypeMsg.ipv6, prefix + k));
                break;
            case "mac":
                match = data[k].match(RE.mac[0]) || data[k].match(RE.mac[1]);
                if (!match || match[0].length != data[k].length)
                    throw new TypeError(util.format(rule[k].msg.type || TypeMsg.mac, prefix + k));
                break;
            case "uuid":
                match = data[k].match(RE.uuid);
                if (!match || match[0].length != data[k].length)
                    throw new TypeError(util.format(rule[k].msg.type || TypeMsg.uuid, prefix + k));
                break;
            case "isbn":
                var isbn = ISBN.parse(data[k]);
                if (!isbn || (rule[k].strict && isbn.codes.isbn10h != data[k] && isbn.codes.isbn13h != data[k]))
                    throw new TypeError(util.format(rule[k].msg.type || TypeMsg.isbn, prefix + k));
                break;
            case "ascii":
                if (byteLength(data[k]) != data[k].length)
                    throw new TypeError(util.format(rule[k].msg.type || TypeMsg.ascii, prefix + k));
                break;
            case "base64":
                match = data[k].match(RE.base64);
                if (!match || match[0].length != data[k].length)
                    throw new TypeError(util.format(rule[k].msg.type || TypeMsg.base64, prefix + k));
                break;
            case "json":
                try {
                    JSON.parse(data[k]);
                } catch (e) {
                    throw new TypeError(util.format(rule[k].msg.type || TypeMsg.json, prefix + k));
                }
                break;
            case "data-uri":
                match = data[k].match(RE.dataURI[0]) ||
                    data[k].match(RE.dataURI[1]) ||
                    data[k].match(RE.dataURI[2]) ||
                    data[k].match(RE.dataURI[3]) ||
                    data[k].match(RE.dataURI[4]) ||
                    data[k].match(RE.dataURI[5]);
                if (!match || match[0].length != data[k].length)
                    throw new TypeError(util.format(rule[k].msg.type || TypeMsg.dataURI, prefix + k));
                break;
        }

        // Check equivalents.
        if (rule[k].equals && rule[rule[k].equals]) {
            if (data[k] != data[rule[k].equals])
                throw new Error(util.format(rule[k].msg.equals || "The value of '%s' must be the same as '%s'.", prefix + k, prefix + rule[k].equals));
        }

        if ((rule[k].type === "array" || strings.includes(rule[k].type)) && rule[k].length) {
            var isArray = rule[k].type === "array",
                word = isArray ? "element" : "character",
                words = isArray ? "elements" : "characters";
            // Check string/array length.
            if (rule[k].length instanceof Array) {
                var min = rule[k].length[0],
                    max = rule[k].length[1];
                if (data[k].length < min || data[k].length > max)
                    throw new Error(util.format(rule[k].msg.length || `'%s' must carry at least %d and no more than %d ${words}.`, prefix + k, min, max));
            } else if (data[k].length != rule[k].length) {
                throw new Error(util.format(rule[k].msg.length || ("'%s' must carry %d " + (rule[k].length == 1 ? word : words)), prefix + k, rule[k].length));
            }
        } else if (rule[k].type == "number" && rule[k].range) {
            // Check number range.
            if (rule[k].range instanceof Array) {
                var min = rule[k].range[0],
                    max = rule[k].range[1];
                if (data[k] < min || data[k] > max)
                    throw new RangeError(util.format(rule[k].msg.range || "The value of '%s' must between %d and %d.", prefix + k, min, max));
            }
        } else if (typeof data[k] == "object") {
            // Walk through object.
            validate(rule[k].children, data[k], `${prefix}${k}.`);
        }
    }
    return true;
}

function checkBasicType(rule, data, k, type, prefix = "") {
    var types = ["string", "number", "boolean"];
    if (types.includes(type) && typeof data[k] != type)
        throw new TypeError(util.format(rule[k].msg.type || `'%s' must be a valid ${type}.`, prefix + k));
}

function checkHexColor(value, strict = false) {
    var re = strict ? RE.hexColor[0] : RE.hexColor[1],
        match = value.match(re);
    return match && match[0].length == value.length;
}

function checkRgbColor(value) {
    var match = value.match(/(rgb|rgba)\((.*?)\)/i);
    if (!match || match[0].length != value.length)
        return false;
    else {
        var parts = match[2].split(",");
        if ((match[1] == "rgb" && parts.length != 3) || (match[1] == "rgba" && parts.length != 4))
            return false;
        parts.map(v => parseFloat(v));
        if (parts[0] < 0 || parts[0] > 255 ||
            parts[1] < 0 || parts[1] > 255 ||
            parts[2] < 0 || parts[2] > 255 ||
            (parts.length == 4 && (parts[3] < 0 || parts[3] > 1)))
            return false;
    }
    return true;
}

function byteLength(str) {
    if (typeof Buffer == "object")
        return Buffer.byteLength(str);
    var b = 0,
        l = str.length;
    if (l) {
        for (var i = 0; i < l; i++) {
            if (str.charCodeAt(i) > 255) {
                b += 3;
            } else {
                b++;
            }
        }
        return b;
    } else {
        return 0;
    }
}

/**
 * Simple Friendly Node.js Validator.
 */
class Validator {
    /**
     * Creates a validator with a specified rule.
     * @param {Object} rule The validating rule.
     */
    constructor(rule = null) {
        if (rule)
            this.set(rule);
    }

    /**
     * Sets the validating rule.
     * @param {Object} rule The validating rule.
     */
    set(rule) {
        return this.rule = setRule(rule);
    }

    /**
     * Filters input data according to the validating rule.
     * @param {Object} data 
     */
    filter(data) {
        return filter(this.rule, data);
    }

    /**
     * Checks if the input data are all valid.
     * @param {Object} data 
     */
    check(data) {
        return validate(this.rule, data);
    }
}

module.exports = Validator;