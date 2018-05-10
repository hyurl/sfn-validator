const assert = require("assert");
const Validator = require("../");

describe("Validate with base64 strings", function () {
    it("should validate rule of a simple base64 string", function () {
        var validator = new Validator({
            data: "base64"
        });

        var expected = {
            data: {
                type: "base64",
                required: false,
                msg: {
                    type: "'data' must be a valid base64 string."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({}); // pass
        validator.validate({ data: "sabidsiwhe2683eirh87w4ho2nr9834o==" }); // pass

        var hasError = false;
        try {
            validator.validate({ data: "This string contains characters not in base64 alphabet." }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.data.msg.type);
        }
        assert(hasError);
    });

    it("should validate rule of a required base64 string", function () {
        var validator = new Validator({
            data: {
                type: "base64",
                required: true,
            }
        });

        var expected = {
            data: {
                type: "base64",
                required: true,
                msg: {
                    type: "'data' must be a valid base64 string.",
                    required: "'data' must be provided."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ data: "sabidsiwhe2683eirh87w4ho2nr9834o==" }); // pass

        var hasError = false;
        try {
            validator.validate({}); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.data.msg.required);
        }
        assert(hasError);
    });

    it("should validate rule of a base64 string with a certain length", function () {
        var validator = new Validator({
            data: {
                type: "base64",
                length: 34,
            }
        });

        var expected = {
            data: {
                type: "base64",
                required: false,
                length: 34,
                msg: {
                    type: "'data' must be a valid base64 string.",
                    length: "'data' must contain 34 characters."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ data: "sabidsiwhe2683eirh87w4ho2nr9834o==" }); // pass

        var hasError = false;
        try {
            validator.validate({ data: "sabidsiwhe2683eirh87w4ho2nr9834o" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.data.msg.length);
        }
        assert(hasError);
    });

    it("should validate rule of a base64 string with length range", function () {
        var validator = new Validator({
            data: {
                type: "base64",
                length: [16, 64],
            }
        });

        var expected = {
            data: {
                type: "base64",
                required: false,
                length: [16, 64],
                msg: {
                    type: "'data' must be a valid base64 string.",
                    length: "'data' must contain at least 16 and at most 64 characters."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ data: "sabidsiwhe2683eirh87w4ho2nr9834o==" }); // pass

        var hasError = false;
        try {
            validator.validate({ data: "sabidsiwh==" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.data.msg.length);
        }
        assert(hasError);

        var hasError2 = false;
        try {
            validator.validate({ data: "sabidsiwhe2683eirh8sabsianwee7495tibighe871iiufeuh237w4ho2nr9834o==" }); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.data.msg.length);
        }
        assert(hasError2);
    });
});