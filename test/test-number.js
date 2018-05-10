const assert = require("assert");
const Validator = require("../");

describe("Validate with numbers", function () {
    it("should validate rule of a simple number", function () {
        var validator = new Validator({
            score: "number"
        });

        var expected = {
            score: {
                type: "number",
                required: false,
                strict: true,
                msg: {
                    type: "'score' must be a valid number."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({}); // pass
        validator.validate({ score: 100 }); // pass

        var hasError = false;
        try {
            validator.validate({ score: "100" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.score.msg.type);
        }
        assert(hasError);
    });

    it("should validate rule of a required number", function () {
        var validator = new Validator({
            score: {
                type: "number",
                required: true
            }
        });

        var expected = {
            score: {
                type: "number",
                required: true,
                strict: true,
                msg: {
                    type: "'score' must be a valid number.",
                    required: "'score' must be provided."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ score: 100 }); // pass

        var hasError = false;
        try {
            validator.validate({}); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.score.msg.required);
        }
        assert(hasError);
    });

    it("should validate rule of a number in non-strict mode", function () {
        var validator = new Validator({
            score: {
                type: "number",
                strict: false
            }
        });

        var expected = {
            score: {
                type: "number",
                required: false,
                strict: false,
                msg: {
                    type: "'score' must be a valid number or a numeric string."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({}); // pass
        validator.validate({ score: 100 }); // pass
        validator.validate({ score: "100" }); // pass

        var hasError = false;
        try {
            validator.validate({ score: "NaN" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.score.msg.type);
        }
        assert(hasError);
    });

    it("should validate rule of a number with a certain range", function () {
        var hasError = false;
        try {
            var validator = new Validator({
                score: {
                    type: "number",
                    range: 10 // wrong type of range
                }
            });
        } catch (err) {
            hasError = true;
            assert.equal(err.message, "'score' must be an array that contains only 2 numbers.");
        }
        assert(hasError);

        var validator = new Validator({
            score: {
                type: "number",
                range: [1, 10]
            }
        });

        var expected = {
            score: {
                type: "number",
                required: false,
                strict: true,
                range: [1, 10],
                msg: {
                    type: "'score' must be a valid number.",
                    range: "The value of 'score' must between 1 and 10."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ score: 1 }); // pass
        validator.validate({ score: 5 }); // pass
        validator.validate({ score: 10 }); // pass

        var hasError2 = false;
        try {
            validator.validate({ score: 11 }); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.score.msg.range);
        }
        assert(hasError2);
    });

    it("should validate rule of a required number with customized message", function () {
        var rule = {
            score: {
                type: "number",
                required: true,
                msg: {
                    required: "The 'score' must be provided.",
                }
            }
        };

        var validator = new Validator(rule);

        var expected = {
            score: {
                type: "number",
                required: true,
                strict: true,
                msg: {
                    type: "'score' must be a valid number.",
                    required: rule.score.msg.required,
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ score: 5 }); // pass

        var hasError = false;
        try {
            validator.validate({}); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.score.msg.required);
        }
        assert(hasError);
    });

    it("should validate rule of a number that requires equality to another field", function () {
        var hasError = false;
        try {
            var validator = new Validator({
                score: {
                    type: "number",
                    // required: true,
                },
                confirm_score: {
                    type: "number",
                    equals: "score"
                }
            });
        } catch (err) {
            hasError = true;
            assert.equal(err.message, "comparing field 'score' must be defined with type 'number' and is required.");
        }
        assert(hasError);

        var validator = new Validator({
            score: {
                type: "number",
                required: true,
            },
            confirm_score: {
                type: "number",
                equals: "score"
            }
        });

        var expected = {
            score: {
                type: "number",
                required: true,
                strict: true,
                msg: {
                    type: "'score' must be a valid number.",
                    required: "'score' must be provided.",
                }
            },
            confirm_score: {
                type: "number",
                required: false,
                strict: true,
                equals: "score",
                msg: {
                    type: "'confirm_score' must be a valid number.",
                    equals: "The value of 'confirm_score' must be the same as 'score'."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ score: 10000, confirm_score: 10000 }); //pass

        var hasError2 = false;
        try {
            validator.validate({ score: 10000, confirm_score: 9999 }); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.confirm_score.msg.equals);
        }
        assert(hasError2);
    });
});