const assert = require("assert");
const Validator = require("../");

describe("Validate with IPv6 addresses", function () {
    it("should validate rule of a simple IPv6 address", function () {
        var validator = new Validator({
            ip: "ipv6"
        });

        var expected = {
            ip: {
                type: "ipv6",
                required: false,
                msg: {
                    type: "'ip' must be a valid IPv6 address.",
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({}); // pass
        validator.validate({ ip: "::1" }); // pass
        validator.validate({ ip: "fe80::e1e1:8347:c7d1:1f50" }); // pass

        var hasError = false;
        try {
            validator.validate({ ip: "abcd" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.ip.msg.type);
        }
        assert(hasError);

        var hasError2 = false;
        try {
            validator.validate({ ip: "255.0.0.1" }); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.ip.msg.type);
        }
        assert(hasError2);
    });

    it("should validate rule of a required IPv4 address", function () {
        var validator = new Validator({
            ip: {
                type: "ipv6",
                required: true
            }
        });

        var expected = {
            ip: {
                type: "ipv6",
                required: true,
                msg: {
                    type: "'ip' must be a valid IPv6 address.",
                    required: "'ip' must be provided."
                }
            }
        }

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ ip: "::1" }); // pass

        var hasError = false;
        try {
            validator.validate({}); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.ip.msg.required);
        }
        assert(hasError);
    });

    it("should validate rule an IPv4 address that requires equality to another field", function () {
        var hasError = false;
        try {
            var validator = new Validator({
                ip: "ipv6",
                confirm_ip: {
                    type: "ipv6",
                    equals: "ip",
                }
            });
        } catch (err) {
            hasError = true;
            assert.equal(err.message, "comparing field 'ip' must be defined with type 'ipv6' and is required.");
        }
        assert(hasError);

        var hasError2 = false;
        try {
            var validator = new Validator({
                ip: {
                    type: "ipv4",
                    required: true
                },
                confirm_ip: {
                    type: "ipv6",
                    equals: "ip",
                }
            });
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, "comparing field 'ip' must be defined with type 'ipv6' and is required.");
        }
        assert(hasError2);

        var validator = new Validator({
            ip: {
                type: "ipv6",
                required: true,
            },
            confirm_ip: {
                type: "ipv6",
                equals: "ip",
            }
        });

        var expected = {
            ip: {
                type: "ipv6",
                required: true,
                msg: {
                    type: "'ip' must be a valid IPv6 address.",
                    required: "'ip' must be provided."
                }
            },
            confirm_ip: {
                type: "ipv6",
                required: false,
                equals: "ip",
                msg: {
                    type: "'confirm_ip' must be a valid IPv6 address.",
                    equals: "The value of 'confirm_ip' must be the same as 'ip'."
                }
            }
        }

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ ip: "fe80::e1e1:8347:c7d1:1f50" }); // pass
        validator.validate({ ip: "fe80::e1e1:8347:c7d1:1f50", confirm_ip: "fe80::e1e1:8347:c7d1:1f50" }); // pass

        var hasError3 = false;
        try {
            validator.validate({}); // error
        } catch (err) {
            hasError3 = true;
            assert.equal(err.message, expected.ip.msg.required);
        }
        assert(hasError3);

        var hasError4 = false;
        try {
            validator.validate({ ip: "fe80::e1e1:8347:c7d1:1f50", confirm_ip: "fe80::e1e1:8347:c7d1:1f51" }); // error
        } catch (err) {
            hasError4 = true;
            assert.equal(err.message, expected.confirm_ip.msg.equals);
        }
        assert(hasError4);
    });
});