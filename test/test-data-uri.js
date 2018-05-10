const assert = require("assert");
const Validator = require("../");

describe("Validate with Data URI strings", function () {
    it("should validate rule of a simple Data URI string", function () {
        var validator = new Validator({
            data: "data-uri",
        });

        var expected = {
            data: {
                type: "data-uri",
                required: false,
                msg: {
                    type: "'data' must be a valid Data URI string."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({}); // pass
        validator.validate({ data: "data:image/png;base64,iVBORw0KGgoAAA==" }); // pass
        validator.validate({ data: "data:text/plain,ThisIsPlainText" }); // pass
        validator.validate({ data: "data:;base64,iVBORw0KGgoAAA==" }); // pass
        validator.validate({ data: "data:,ThisIsPlainText" }); // pass
        validator.validate({ data: "data:image/png;charset=utf-8;base64,iVBORw0KGgoAAA==" }); // pass
        validator.validate({ data: "data:text/plain;charset=utf-8;page=1,iVBORw0KGgoAAA==" }); // pass
        validator.validate({ data: "data:," });

        var hasError = false;
        try {
            validator.validate({ data: "abcd" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.data.msg.type);
        }
        assert(hasError);

        var hasError2 = false;
        try {
            validator.validate({ data: "data:ThisIsPlainText" }); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.data.msg.type);
        }
        assert(hasError2);
    });

    it("should validate rule of a required Data URI string", function () {
        var validator = new Validator({
            data: {
                type: "data-uri",
                required: true
            }
        });

        var expected = {
            data: {
                type: "data-uri",
                required: true,
                msg: {
                    type: "'data' must be a valid Data URI string.",
                    required: "'data' must be provided."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ data: "data:image/png;base64,iVBORw0KGgoAAA==" }); // pass

        var hasError = false;
        try {
            validator.validate({}); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.data.msg.required);
        }
        assert(hasError);
    });

    it("should validate rule of a Data URI string with a certain length", function () {
        var validator = new Validator({
            data: {
                type: "data-uri",
                required: true,
                length: 38
            }
        });

        var expected = {
            data: {
                type: "data-uri",
                required: true,
                length: 38,
                msg: {
                    type: "'data' must be a valid Data URI string.",
                    required: "'data' must be provided.",
                    length: "'data' must contain 38 characters."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ data: "data:image/png;base64,iVBORw0KGgoAAA==" }); // pass

        var hasError = false;
        try {
            validator.validate({ data: "data:text/plain,ThisTextIsTooShort"}); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.data.msg.length);
        }
        assert(hasError);

        var hasError2 = false;
        try {
            validator.validate({ data: "data:text/plain,ThisTextIsALittleBitLong"}); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.data.msg.length);
        }
        assert(hasError2);
    });

    it("should validate rule of a Data URI string with length range", function () {
        var validator = new Validator({
            data: {
                type: "data-uri",
                required: true,
                length: [16, 64]
            }
        });

        var expected = {
            data: {
                type: "data-uri",
                required: true,
                length: [16, 64],
                msg: {
                    type: "'data' must be a valid Data URI string.",
                    required: "'data' must be provided.",
                    length: "'data' must contain at least 16 and at most 64 characters."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ data: "data:image/png;base64,iVBORw0KGgoAAA==" }); // pass

        var hasError = false;
        try {
            validator.validate({ data: "data:,ShortText"}); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.data.msg.length);
        }
        assert(hasError);

        var hasError2 = false;
        try {
            validator.validate({ data: "data:text/plain,ThisTextIsVeryLongSoItDoesn'tPassTheTextAndWillCauseAnError"}); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.data.msg.length);
        }
        assert(hasError2);
    });
})