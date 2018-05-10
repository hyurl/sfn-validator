const assert = require("assert");
const Validator = require("../");

describe("Validate with urls", function () {
    it("should validate rule of a simple url", function () {
        var validator = new Validator({
            homepage: "url"
        });

        var expected = {
            homepage: {
                type: "url",
                required: false,
                strict: false,
                msg: {
                    type: "'homepage' must be a valid URL address."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({}); // pass
        validator.validate({ homepage: "//hyurl.com" }); // pass
        validator.validate({ homepage: "http://hyurl.com" }); // pass
        validator.validate({ homepage: "http://hyurl.中国" }); // pass

        var hasError = false;
        try {
            validator.validate({ homepage: "abcd" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.homepage.msg.type);
        }
        assert(hasError);
    });

    it("should validate rule of a required url", function () {
        var validator = new Validator({
            homepage: {
                type: "url",
                required: true,
            }
        });

        var expected = {
            homepage: {
                type: "url",
                required: true,
                strict: false,
                msg: {
                    type: "'homepage' must be a valid URL address.",
                    required: "'homepage' must be provided."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ homepage: "//hyurl.com" }); // pass
        validator.validate({ homepage: "http://hyurl.com" }); // pass
        validator.validate({ homepage: "http://hyurl.中国" }); // pass

        var hasError = false;
        try {
            validator.validate({}); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.homepage.msg.required);
        }
        assert(hasError);
    });

    it("should validate rule of a url in strict mode", function () {
        var validator = new Validator({
            homepage: {
                type: "url",
                strict: true
            }
        });

        var expected = {
            homepage: {
                type: "url",
                required: false,
                strict: true,
                msg: {
                    type: "'homepage' must be a valid URL address."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ homepage: "//hyurl.com" }); // pass
        validator.validate({ homepage: "http://hyurl.com" }); // pass

        var hasError = false;
        try {
            validator.validate({ homepage: "http://localhost" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.homepage.msg.type);
        }
        assert(hasError);

        var hasError2 = false;
        try {
            validator.validate({ homepage: "http://hyurl.中国" }); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.homepage.msg.type);
        }
        assert(hasError2);
    });

    it("should validate rule of a url with a certain length", function () {
        var validator = new Validator({
            homepage: {
                type: "url",
                strict: true,
                length: 16
            }
        });

        var expected = {
            homepage: {
                type: "url",
                required: false,
                strict: true,
                length: 16,
                msg: {
                    type: "'homepage' must be a valid URL address.",
                    length: "'homepage' must contain 16 characters."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ homepage: "http://hyurl.com" }); // pass
        validator.validate({ homepage: "http://abcde.com" }); // pass

        var hasError = false;
        try {
            validator.validate({ homepage: "http://abcd.com" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.homepage.msg.length);
        }
        assert(hasError);

        var hasError2 = false;
        try {
            validator.validate({ homepage: "http://abcdef.com" }); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.homepage.msg.length);
        }
        assert(hasError2);
    });

    it("should validate rule of a url with length range", function () {
        var validator = new Validator({
            homepage: {
                type: "url",
                strict: true,
                length: [8, 32]
            }
        });

        var expected = {
            homepage: {
                type: "url",
                required: false,
                strict: true,
                length: [8, 32],
                msg: {
                    type: "'homepage' must be a valid URL address.",
                    length: "'homepage' must contain at least 8 and at most 32 characters."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ homepage: "http://hyurl.com" }); // pass

        var hasError = false;
        try {
            validator.validate({ homepage: "//a.com" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.homepage.msg.length);
        }
        assert(hasError);

        var hasError2 = false;
        try {
            validator.validate({ homepage: "https://hyurl.com/dirname/filename.ext?search=param" }); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.homepage.msg.length);
        }
        assert(hasError2);
    });
});