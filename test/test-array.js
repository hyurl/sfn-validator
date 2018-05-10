const assert = require("assert");
const Validator = require("../");

describe("Validate with arrays", function () {
    it("should validate rule of a simple array", function () {
        var validator = new Validator({
            scores: "array"
        });

        var expected = {
            scores: {
                type: "array",
                required: false,
                msg: {
                    type: "'scores' must be an instance of Array."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({}); // pass
        validator.validate({ scores: [10, 20, 30, 40] }); // pass

        var hasError = false;
        try {
            validator.validate({ scores: "10, 20, 30, 40" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.scores.msg.type);
        }
        assert(hasError);
    });

    it("should validate rule of a required array", function () {
        var validator = new Validator({
            scores: {
                type: "array",
                required: true
            }
        });

        var expected = {
            scores: {
                type: "array",
                required: true,
                msg: {
                    type: "'scores' must be an instance of Array.",
                    required: "'scores' must be provided."
                }
            }
        }

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ scores: [10, 20, 30, 40] }); // pass

        var hasError = false;
        try {
            validator.validate({}); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.scores.msg.required);
        }
        assert(hasError);
    });

    it("should validate rule of an array with a certain length", function () {
        var validator = new Validator({
            scores: {
                type: "array",
                length: 3
            }
        });

        var expected = {
            scores: {
                type: "array",
                required: false,
                length: 3,
                msg: {
                    type: "'scores' must be an instance of Array.",
                    length: "'scores' must contain 3 elements."
                }
            }
        }

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ scores: [10, 20, 30] }); // pass

        var hasError = false;
        try {
            validator.validate({ scores: [10, 20] }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.scores.msg.length);
        }
        assert(hasError);

        var hasError2 = false;
        try {
            validator.validate({ scores: [10, 20, 30, 40] }); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.scores.msg.length);
        }
        assert(hasError2);
    });

    it("should validate rule of an array with length range", function () {
        var validator = new Validator({
            scores: {
                type: "array",
                length: [2, 4]
            }
        });

        var expected = {
            scores: {
                type: "array",
                required: false,
                length: [2, 4],
                msg: {
                    type: "'scores' must be an instance of Array.",
                    length: "'scores' must contain at least 2 and at most 4 elements."
                }
            }
        }

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ scores: [10, 20] }); // pass
        validator.validate({ scores: [10, 20, 30] }); // pass
        validator.validate({ scores: [10, 20, 30, 40] }); // pass

        var hasError = false;
        try {
            validator.validate({ scores: [10] }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.scores.msg.length);
        }
        assert(hasError);

        var hasError2 = false;
        try {
            validator.validate({ scores: [10, 20, 30, 40, 50] }); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.scores.msg.length);
        }
        assert(hasError2);
    });
});