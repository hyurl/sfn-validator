const assert = require("assert");
const Validator = require("../");

describe("Validate with booleans", () => {
    it("should validate rule of a simple boolean field", function () {
        var validator = new Validator({
            activated: "boolean"
        });

        var expected = {
            activated: {
                type: "boolean",
                required: false,
                strict: false,
                msg: {
                    type: "'activated' must be a valid boolean value."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({}); // pass
        validator.validate({ activated: true }); // pass
        validator.validate({ activated: 1 }); // pass
        validator.validate({ activated: 0 }); // pass

        var hasError = false;
        try {
            validator.validate({ activated: "true" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.activated.msg.type);
        }
        assert(hasError);
    });

    it("should validate rule of a required boolean field", function () {
        var validator = new Validator({
            activated: {
                type: "boolean",
                required: true
            }
        });

        var expected = {
            activated: {
                type: "boolean",
                required: true,
                strict: false,
                msg: {
                    type: "'activated' must be a valid boolean value.",
                    required: "'activated' must be provided."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ activated: true }); // pass
        validator.validate({ activated: 1 }); // pass
        validator.validate({ activated: 0 }); // pass

        var hasError = false;
        try {
            validator.validate({}); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.activated.msg.required);
        }
        assert(hasError);
    });

    it("should validate rule of a boolean field in strict mode", function () {
        var validator = new Validator({
            activated: {
                type: "boolean",
                strict: true
            }
        });

        var expected = {
            activated: {
                type: "boolean",
                required: false,
                strict: true,
                msg: {
                    type: "'activated' must be a valid boolean value.",
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ activated: true }); // true

        var hasError = false;
        try {
            validator.validate({ activated: 1 }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.activated.msg.type);
        }
        assert(hasError);
    });
});