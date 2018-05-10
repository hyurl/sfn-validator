const Validator = require("../");
const assert = require("assert");

describe("Validate with strings", function () {
    it("should validate rule of a simple string", function () {
        var validator = new Validator({
            name: "string"
        });

        var expected = {
            name: {
                type: "string",
                required: false,
                msg: {
                    type: "'name' must be a valid string."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({}); // pass
        validator.validate({ name: "Ayon Lee" }); // pass

        var hasError = false;
        try {
            validator.validate({ name: 123 }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.name.msg.type);
        }
        assert(hasError);
    });

    it("should validate rule of a required string", function () {
        var validator = new Validator({
            name: {
                type: "string",
                required: true
            },
        });

        var expected = {
            name: {
                type: "string",
                required: true,
                msg: {
                    type: "'name' must be a valid string.",
                    required: "'name' must be provided."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);

        var hasError = false;
        try {
            validator.validate({});
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.name.msg.required);
        }
        assert(hasError);
    });

    it("should validate rule of a string with a certain length", function () {
        var validator = new Validator({
            name: {
                type: "string",
                length: 10
            }
        });

        var expected = {
            name: {
                type: "string",
                required: false,
                length: 10,
                msg: {
                    type: "'name' must be a valid string.",
                    length: "'name' must contain 10 characters."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ name: "Ayon Lee  " }); // pass

        var hasError = false;
        try {
            validator.validate({ name: "Ayon Lee" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.name.msg.length);
        }
        assert(hasError);
    });

    it("should validate rule of a simple string with length range", function () {
        var validator = new Validator({
            name: {
                type: "string",
                length: [3, 18],
            }
        });

        var expected = {
            name: {
                type: "string",
                length: [3, 18],
                required: false,
                msg: {
                    type: "'name' must be a valid string.",
                    length: "'name' must contain at least 3 and at most 18 characters."
                }
            }
        };


        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({}); // pass
        validator.validate({ name: "Ayon Lee" }); // pass

        var hasError = false;
        try {
            validator.validate({ name: "Hi" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.name.msg.length);
        }
        assert(hasError);

        var hasError2 = false;
        try {
            validator.validate({ name: "Hello, World! Hi Ayon!" }); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.name.msg.length);
        }
        assert(hasError2);
    });

    it("should validate rule of a string with length and customized message", function () {
        var rule = {
            name: {
                type: "string",
                length: 10,
                msg: {
                    length: "The length of 'name' must be 10."
                }
            }
        };

        var validator = new Validator(rule);

        var expected = {
            name: {
                type: "string",
                length: 10,
                required: false,
                msg: {
                    type: "'name' must be a valid string.",
                    length: rule.name.msg.length
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ name: "Ayon Lee  " }); // pass

        var hasError = false;
        try {
            validator.validate({ name: "Ayon Lee" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.name.msg.length);
        }
        assert(hasError);
    });

    it("should validate rule of a string that requires equality to another field", function () {
        var hasError = false;
        try {
            var validator = new Validator({
                name: {
                    type: "string",
                    // required: true,
                },
                confirm_name: {
                    type: "string",
                    equals: "name"
                }
            });
        } catch (err) {
            hasError = true;
            assert.equal(err.message, "comparing field 'name' must be defined with type 'string' and is required.");
        }
        assert(hasError);

        var validator = new Validator({
            name: {
                type: "string",
                required: true,
            },
            confirm_name: {
                type: "string",
                equals: "name"
            }
        });

        var expected = {
            name: {
                type: "string",
                required: true,
                msg: {
                    type: "'name' must be a valid string.",
                    required: "'name' must be provided.",
                }
            },
            confirm_name: {
                type: "string",
                required: false,
                equals: "name",
                msg: {
                    type: "'confirm_name' must be a valid string.",
                    equals: "The value of 'confirm_name' must be the same as 'name'."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ name: "Ayon Lee", confirm_name: "Ayon Lee" }); //pass

        var hasError2 = false;
        try {
            validator.validate({ name: "Ayon Lee", confirm_name: "Ayon Lee!" }); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.confirm_name.msg.equals);
        }
        assert(hasError2);
    });
});