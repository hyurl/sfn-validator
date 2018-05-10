const assert = require("assert");
const Validator = require("../");

describe("Validate with ISBN strings", function () {
    it("should validate rule of s simple ISBN string", function () {
        var validator = new Validator({
            isbn: "isbn"
        });

        var expected = {
            isbn: {
                type: "isbn",
                required: false,
                strict: false,
                msg: {
                    type: "'isbn' must be a valid ISBN string."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({}); // pass
        validator.validate({ isbn: "1-933988-03-7" }); // pass
        validator.validate({ isbn: "1933988037" }); // pass
        validator.validate({ isbn: "978-4-87311-336-4" }); // pass
        validator.validate({ isbn: "9784873113364" }); // pass

        var hasError = false;
        try {
            validator.validate({ isbn: "12345" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.isbn.msg.type);
        }
        assert(hasError);
    });

    it("should validate rule of s required ISBN string", function () {
        var validator = new Validator({
            isbn: {
                type: "isbn",
                required: true
            }
        });

        var expected = {
            isbn: {
                type: "isbn",
                required: true,
                strict: false,
                msg: {
                    type: "'isbn' must be a valid ISBN string.",
                    required: "'isbn' must be provided."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ isbn: "1-933988-03-7" }); // pass
        validator.validate({ isbn: "1933988037" }); // pass
        validator.validate({ isbn: "978-4-87311-336-4" }); // pass
        validator.validate({ isbn: "9784873113364" }); // pass

        var hasError = false;
        try {
            validator.validate({}); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.isbn.msg.required);
        }
        assert(hasError);
    });

    it("should validate rule of s required ISBN string in strict mode", function () {
        var validator = new Validator({
            isbn: {
                type: "isbn",
                required: true,
                strict: true
            }
        });

        var expected = {
            isbn: {
                type: "isbn",
                required: true,
                strict: true,
                msg: {
                    type: "'isbn' must be a valid ISBN string.",
                    required: "'isbn' must be provided."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ isbn: "1-933988-03-7" }); // pass
        validator.validate({ isbn: "978-4-87311-336-4" }); // pass

        var hasError = false;
        try {
            validator.validate({}); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.isbn.msg.required);
        }
        assert(hasError);

        var hasError2 = false;
        try {
            validator.validate({ isbn: "1933988037" }); // pass
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.isbn.msg.type);
        }
        assert(hasError2);

        var hasError2 = false;
        try {
            validator.validate({ isbn: "9784873113364" }); // pass
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.isbn.msg.type);
        }
        assert(hasError2);
    });
});