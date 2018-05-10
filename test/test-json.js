const assert = require("assert");
const Validator = require("../");

describe("Validate with JSON strings", function () {
    it("should validate rule of a simple JSON string", function () {
        var validator = new Validator({
            data: "json"
        });

        var expected = {
            data: {
                type: "json",
                required: false,
                msg: {
                    type: "'data' must be a valid JSON string."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({}); // pass
        validator.validate({ data: '{ "hello": "world"}' }); // pass

        var hasError = false;
        try {
            validator.validate({ data: "Not JSON" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.data.msg.type);
        }
        assert(hasError);
    });

    it("should validate rule of a required JSON string", function () {
        var validator = new Validator({
            data: {
                type: "json",
                required: true,
            }
        });

        var expected = {
            data: {
                type: "json",
                required: true,
                msg: {
                    type: "'data' must be a valid JSON string.",
                    required: "'data' must be provided."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ data: '{ "hello": "world"}' }); // pass

        var hasError = false;
        try {
            validator.validate({ }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.data.msg.required);
        }
        assert(hasError);
    });

    it("should validate rule of a JSON string with a certain length", function () {
        var validator = new Validator({
            data: {
                type: "json",
                length: 19,
            }
        });

        var expected = {
            data: {
                type: "json",
                required: false,
                length: 19,
                msg: {
                    type: "'data' must be a valid JSON string.",
                    length: "'data' must contain 19 characters."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ data: '{ "hello": "world"}' }); // pass

        var hasError = false;
        try {
            validator.validate({ data: '{ "hi": "ayon" }' }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.data.msg.length);
        }
        assert(hasError);
    });

    it("should validate rule of a JSON string with length range", function () {
        var validator = new Validator({
            data: {
                type: "json",
                length: [16, 32],
            }
        });

        var expected = {
            data: {
                type: "json",
                required: false,
                length: [16, 32],
                msg: {
                    type: "'data' must be a valid JSON string.",
                    length: "'data' must contain at least 16 and at most 32 characters."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ data: '{ "hello": "world"}' }); // pass

        var hasError = false;
        try {
            validator.validate({ data: '{"hi":"ayon"}' }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.data.msg.length);
        }
        assert(hasError);

        var hasError2 = false;
        try {
            validator.validate({ data: '{"shouldError":"because the length is more than 32"}' }); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.data.msg.length);
        }
        assert(hasError2);
    });
});