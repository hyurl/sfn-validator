const assert = require("assert");
const Validator = require("../");

describe("Validate with dates", function () {
    it("should validate rule of a simple date", function () {
        var validator = new Validator({
            created_at: "date"
        });

        var expected = {
            created_at: {
                type: "date",
                required: false,
                msg: {
                    type: "'created_at' must be an instance of Date or a valid date string."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({}); // pass
        validator.validate({ created_at: new Date() }); // pass
        validator.validate({ created_at: new Date().toString() }); // pass
        validator.validate({ created_at: new Date().toUTCString() }); // pass
        validator.validate({ created_at: "2018/005/10" }); // pass
        validator.validate({ created_at: "2018/005/10 15:13" }); // pass

        var hasError = false;
        try {
            validator.validate({ created_at: 12345 }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.created_at.msg.type);
        }
        assert(hasError);

        var hasError2 = false;
        try {
            validator.validate({ created_at: false }); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.created_at.msg.type);
        }
        assert(hasError2);

        var hasError3 = false;
        try {
            validator.validate({ created_at: "abc" }); // error
        } catch (err) {
            hasError3 = true;
            assert.equal(err.message, expected.created_at.msg.type);
        }
        assert(hasError3);
    });

    it("should validate rule of a required date", function () {
        var validator = new Validator({
            created_at: {
                type: "date",
                required: true
            }
        });

        var expected = {
            created_at: {
                type: "date",
                required: true,
                msg: {
                    type: "'created_at' must be an instance of Date or a valid date string.",
                    required: "'created_at' must be provided."
                }
            }
        }

        assert.deepStrictEqual(validator.rules, expected);

        var hasError = false;
        try {
            validator.validate({}); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.created_at.msg.required);
        }
        assert(hasError);
    });
});