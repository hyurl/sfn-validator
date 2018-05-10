const assert = require("assert");
const Validator = require("../");

describe("Validate with colors", function () {
    it("should validate rule of a simple color", function () {
        var validator = new Validator({
            color: "color"
        });

        var expected = {
            color: {
                type: "color",
                required: false,
                msg: {
                    type: "'color' must be a valid color name, a hex, RGB or RGBA color string."
                } 
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({}); // pass
        validator.validate({ color: "red" }); // pass
        validator.validate({ color: "blue" }); // pass
        validator.validate({ color: "#fff" }); // pass
        validator.validate({ color: "#ffffff" }); // pass
        validator.validate({ color: "#FFF" }); // pass
        validator.validate({ color: "#FFFFFF" }); // pass
        validator.validate({ color: "#ffff" }); // pass
        validator.validate({ color: "#ffffffff" }); // pass
        validator.validate({ color: "rgb(0, 0, 0)" }); // pass
        validator.validate({ color: "rgb(125,125,125)" }); // pass
        validator.validate({ color: "rgba(0, 0, 0, 0)" }); // pass
        validator.validate({ color: "rgba(125, 125, 125, 1)" }); // pass

        var hasError = false;
        try {
            validator.validate({ color: "abcd" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.color.msg.type);
        }
        assert(hasError);

        var hasError2 = false;
        try {
            validator.validate({ color: "#ggg" }); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.color.msg.type);
        }
        assert(hasError2);

        var hasError3 = false;
        try {
            validator.validate({ color: "#abcdefgh" }); // error
        } catch (err) {
            hasError3 = true;
            assert.equal(err.message, expected.color.msg.type);
        }
        assert(hasError3);

        var hasError4 = false;
        try {
            validator.validate({ color: "rgb(0,0,0,0)" }); // error
        } catch (err) {
            hasError4 = true;
            assert.equal(err.message, expected.color.msg.type);
        }
        assert(hasError4);

        var hasError5 = false;
        try {
            validator.validate({ color: "rgb(256,0,0)" }); // error
        } catch (err) {
            hasError5 = true;
            assert.equal(err.message, expected.color.msg.type);
        }
        assert(hasError5);

        var hasError6 = false;
        try {
            validator.validate({ color: "rgba(0,0,0,2)" }); // error
        } catch (err) {
            hasError6 = true;
            assert.equal(err.message, expected.color.msg.type);
        }
        assert(hasError6);
    });

    it("should validate rule of a required color", function () {
        var validator = new Validator({
            color: {
                type: "color",
                required: true
            }
        });

        var expected = {
            color: {
                type: "color",
                required: true,
                msg: {
                    type: "'color' must be a valid color name, a hex, RGB or RGBA color string.",
                    required: "'color' must be provided."
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ color: "#fff" }); // pass

        var hasError = false;
        try {
            validator.validate({}); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.color.msg.required);
        }
        assert(hasError);
    });    
});