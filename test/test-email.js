const assert = require("assert");
const Validator = require("../");

describe("Validate with emails", function () {
    it("should validate rule of a simple email", function () {
        var validator = new Validator({
            email: "email"
        });

        var expected = {
            email: {
                type: "email",
                required: false,
                strict: false,
                msg: {
                    type: "'email' must be a valid email address."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({}); // pass
        validator.validate({ email: "i@hyurl.com" }); // pass
        validator.validate({ email: "ayon@localhost.com" }); // pass
        validator.validate({ email: "my-email@example.中国" }); // pass

        var hasError = false;
        try {
            validator.validate({ email: "abcd" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.email.msg.type);
        }
        assert(hasError);
    });

    it("should validate rule of a required email", function () {
        var validator = new Validator({
            email: {
                type: "email",
                required: true,
            }
        });

        var expected = {
            email: {
                type: "email",
                required: true,
                strict: false,
                msg: {
                    type: "'email' must be a valid email address.",
                    required: "'email' must be provided."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ email: "i@hyurl.com" }); // pass
        validator.validate({ email: "ayon@localhost" }); // pass
        validator.validate({ email: "my-email@example.中国" }); // pass

        var hasError = false;
        try {
            validator.validate({}); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.email.msg.required);
        }
        assert(hasError);
    });

    it("should validate rule of an email in strict mode", function () {
        var validator = new Validator({
            email: {
                type: "email",
                strict: true
            }
        });

        var expected = {
            email: {
                type: "email",
                required: false,
                strict: true,
                msg: {
                    type: "'email' must be a valid email address."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ email: "i@hyurl.com" }); // pass

        var hasError = false;
        try {
            validator.validate({ email: "ayon@localhost" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.email.msg.type);
        }
        assert(hasError);

        var hasError2 = false;
        try {
            validator.validate({ email: "my-email@example.中国" }); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.email.msg.type);
        }
        assert(hasError2);
    });

    it("should validate rule of an email with a certain length", function () {
        var validator = new Validator({
            email: {
                type: "email",
                strict: true,
                length: 14
            }
        });

        var expected = {
            email: {
                type: "email",
                required: false,
                strict: true,
                length: 14,
                msg: {
                    type: "'email' must be a valid email address.",
                    length: "'email' must contain 14 characters."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ email: "ayon@hyurl.com" }); // pass

        var hasError = false;
        try {
            validator.validate({ email: "ayonium@hyurl.com" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.email.msg.length);
        }
        assert(hasError);

        var hasError2 = false;
        try {
            validator.validate({ email: "i@hyurl.com" }); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.email.msg.length);
        }
        assert(hasError2);
    });

    it("should validate rule of an email with length range", function () {
        var validator = new Validator({
            email: {
                type: "email",
                strict: true,
                length: [8, 32]
            }
        });

        var expected = {
            email: {
                type: "email",
                required: false,
                strict: true,
                length: [8, 32],
                msg: {
                    type: "'email' must be a valid email address.",
                    length: "'email' must contain at least 8 and at most 32 characters."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ email: "ayon@hyurl.com" }); // pass

        var hasError = false;
        try {
            validator.validate({ email: "i@qq.cn" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.email.msg.length);
        }
        assert(hasError);

        var hasError2 = false;
        try {
            validator.validate({ email: "long-address@very-long-domain.com" }); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.email.msg.length);
        }
        assert(hasError2);
    });
});