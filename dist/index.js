"use strict";
require("source-map-support/register");
var util_1 = require("./util");
/**
 * Simple Friendly Node.js Validator.
 */
var Validator = /** @class */ (function () {
    /**
     * Creates a validator with specified rules.
     */
    function Validator(rules) {
        try {
            this.rules = util_1.parseRule(rules);
        }
        catch (err) {
            throw util_1.replaceError(err, "new Validator"); // re-throw error.
        }
    }
    /** Filters input data according to the rules (doesn't validate). */
    Validator.prototype.filter = function (data) {
        return util_1.filter(this.rules, data);
    };
    /** Checks if the input data are all valid. */
    Validator.prototype.validate = function (data) {
        try {
            return util_1.validate(this.rules, data);
        }
        catch (err) {
            throw util_1.replaceError(err, "Validator.validate"); // re-throw error.
        }
    };
    /** An alias of `validate()`.  */
    Validator.prototype.check = function (data) {
        try {
            return util_1.validate(this.rules, data);
        }
        catch (err) {
            throw util_1.replaceError(err, "Validator.check"); // re-throw error.
        }
    };
    return Validator;
}());
module.exports = Validator;
//# sourceMappingURL=index.js.map