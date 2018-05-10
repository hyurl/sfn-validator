const assert = require("assert");
const Validator = require("../");

describe("Validate with MAC addresses", function () {
    it("should validate rule of a simple MAC address", function () {
        var validator = new Validator({
            mac: "mac"
        });

        var expected = {
            mac: {
                type: "mac",
                required: false,
                msg: {
                    type: "'mac' must be a valid MAC address.",
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({}); // pass
        validator.validate({ mac: "A0-C5-89-59-0A-D3" }); // pass
        validator.validate({ mac: "A0:C5:89:59:0A:D7" }); // pass

        var hasError = false;
        try {
            validator.validate({ mac: "abcd" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.mac.msg.type);
        }
        assert(hasError);

        var hasError2 = false;
        try {
            validator.validate({ mac: "fe80::e1e1:8347:c7d1:1f50" }); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.mac.msg.type);
        }
        assert(hasError2);

        var hasError3 = false;
        try {
            validator.validate({ mac: " A0:C5:89:59:0A:D7" }); // error
        } catch (err) {
            hasError3 = true;
            assert.equal(err.message, expected.mac.msg.type);
        }
        assert(hasError3);

        var hasError4 = false;
        try {
            validator.validate({ mac: "A0:C5:89:59:0A:D7 " }); // error
        } catch (err) {
            hasError4 = true;
            assert.equal(err.message, expected.mac.msg.type);
        }
        assert(hasError4);
    });

    it("should validate rule of a required IPv4 address", function () {
        var validator = new Validator({
            mac: {
                type: "mac",
                required: true
            }
        });

        var expected = {
            mac: {
                type: "mac",
                required: true,
                msg: {
                    type: "'mac' must be a valid MAC address.",
                    required: "'mac' must be provided."
                }
            }
        }

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ mac: "A0-C5-89-59-0A-D3" }); // pass

        var hasError = false;
        try {
            validator.validate({}); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.mac.msg.required);
        }
        assert(hasError);
    });

    it("should validate rule an IPv4 address that requires equality to another field", function () {
        var hasError = false;
        try {
            var validator = new Validator({
                mac: "mac",
                confirm_mac: {
                    type: "mac",
                    equals: "mac",
                }
            });
        } catch (err) {
            hasError = true;
            assert.equal(err.message, "comparing field 'mac' must be defined with type 'mac' and is required.");
        }
        assert(hasError);

        var hasError2 = false;
        try {
            var validator = new Validator({
                mac: {
                    type: "ipv4",
                    required: true
                },
                confirm_mac: {
                    type: "mac",
                    equals: "mac",
                }
            });
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, "comparing field 'mac' must be defined with type 'mac' and is required.");
        }
        assert(hasError2);

        var validator = new Validator({
            mac: {
                type: "mac",
                required: true,
            },
            confirm_mac: {
                type: "mac",
                equals: "mac",
            }
        });

        var expected = {
            mac: {
                type: "mac",
                required: true,
                msg: {
                    type: "'mac' must be a valid MAC address.",
                    required: "'mac' must be provided."
                }
            },
            confirm_mac: {
                type: "mac",
                required: false,
                equals: "mac",
                msg: {
                    type: "'confirm_mac' must be a valid MAC address.",
                    equals: "The value of 'confirm_mac' must be the same as 'mac'."
                }
            }
        }

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ mac: "A0-C5-89-59-0A-D3" }); // pass
        validator.validate({ mac: "A0-C5-89-59-0A-D3", confirm_mac: "A0-C5-89-59-0A-D3" }); // pass

        var hasError3 = false;
        try {
            validator.validate({}); // error
        } catch (err) {
            hasError3 = true;
            assert.equal(err.message, expected.mac.msg.required);
        }
        assert(hasError3);

        var hasError4 = false;
        try {
            validator.validate({ mac: "A0-C5-89-59-0A-D3", confirm_mac: "A0-C5-89-59-0A-D7" }); // error
        } catch (err) {
            hasError4 = true;
            assert.equal(err.message, expected.confirm_mac.msg.equals);
        }
        assert(hasError4);
    });
});