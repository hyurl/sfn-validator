const assert = require("assert");
const Validator = require("../");

describe("Check error stacks", function () {
    it("should show the location of where the rule definition is incorrect", function () {
        var hasError = false;
        try {
            var validator = new Validator({ // must not modify this line.
                name: "as"
            });
        } catch (err) {
            hasError = true;
            assert.equal(err.stack.split("\n")[1], "    at new Validator (" + __filename + ":8:29)");
        }
        assert(hasError);
    });

    it("should show the location of where the data are failed on check", function () {
        var validator = new Validator({
            name: "string"
        });

        var hasError = false;
        try {
            validator.validate({ name: 12345 }); // must not modify this line.
        } catch (err) {
            hasError = true;
            assert.equal(err.stack.split("\n")[1], "    at Validator.validate (" + __filename + ":25:23)");
        }
        assert(hasError);

        var hasError2 = false;
        try {
            validator.check({ name: 12345 }); // must not modify this line.
        } catch (err) {
            hasError2 = true;
            assert.equal(err.stack.split("\n")[1], "    at Validator.check (" + __filename + ":34:23)");
        }
        assert(hasError2);
    });
});