const assert = require("assert");
const Validator = require("../");

describe("Validate with ASCII strings", function () {
    it("should validate rule of a simple ASCII string", function () {
        var validator = new Validator({
            name: "ascii"
        });

        var expected = {
            name: {
                type: "ascii",
                required: false,
                msg: {
                    type: "'name' must be a valid ASCII string."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({}); // pass
        validator.validate({ name: "Ayon Lee" }); // pass

        var hasError = false;
        try {
            validator.validate({ name: "这个字符串不止包含 ASCII 字符。" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.name.msg.type);
        }
        assert(hasError);
    });

    it("should validate rule of a required ASCII string", function () {
        var validator = new Validator({
            name: {
                type: "ascii",
                required: true,
            }
        });

        var expected = {
            name: {
                type: "ascii",
                required: true,
                msg: {
                    type: "'name' must be a valid ASCII string.",
                    required: "'name' must be provided."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ name: "Ayon Lee" }); // pass

        var hasError = false;
        try {
            validator.validate({}); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.name.msg.required);
        }
        assert(hasError);
    });

    it("should validate rule of a ASCII string with a certain length", function () {
        var validator = new Validator({
            name: {
                type: "ascii",
                length: 8,
            }
        });

        var expected = {
            name: {
                type: "ascii",
                required: false,
                length: 8,
                msg: {
                    type: "'name' must be a valid ASCII string.",
                    length: "'name' must contain 8 characters."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ name: "Ayon Lee" }); // pass

        var hasError = false;
        try {
            validator.validate({ name: "Ayonium" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.name.msg.length);
        }
        assert(hasError);
    });

    it("should validate rule of a ASCII string with length range", function () {
        var validator = new Validator({
            name: {
                type: "ascii",
                length: [3, 18],
            }
        });

        var expected = {
            name: {
                type: "ascii",
                required: false,
                length: [3, 18],
                msg: {
                    type: "'name' must be a valid ASCII string.",
                    length: "'name' must contain at least 3 and at most 18 characters."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ name: "Ayon Lee" }); // pass

        var hasError = false;
        try {
            validator.validate({ name: "Ay" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.name.msg.length);
        }
        assert(hasError);

        var hasError2 = false;
        try {
            validator.validate({ name: "Ayonium Franklin Lee" }); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.name.msg.length);
        }
        assert(hasError2);
    });
});