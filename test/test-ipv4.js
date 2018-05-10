const assert = require("assert");
const Validator = require("../");

describe("Validate with IPv4 addresses", function () {
    it("should validate rule of a simple IPv4 address", function () {
        var validator = new Validator({
            ip: "ipv4"
        });

        var expected = {
            ip: {
                type: "ipv4",
                required: false,
                strict: false,
                msg: {
                    type: "'ip' must be a valid IPv4 address.",
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({}); // pass
        validator.validate({ ip: "8.8.8.8" }); // pass
        validator.validate({ ip: "127.0.0.1" }); // pass
        validator.validate({ ip: "192.168.1.1" }); // pass

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
            validator.validate({ ip: "256.0.0.1" }); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.ip.msg.type);
        }
        assert(hasError2);
    });

    it("should validate rule of a required IPv4 address", function() {
        var validator = new Validator({
            ip: {
                type: "ipv4",
                required: true
            }
        });

        var expected = {
            ip: {
                type: "ipv4",
                required: true,
                strict: false,
                msg: {
                    type: "'ip' must be a valid IPv4 address.",
                    required: "'ip' must be provided."
                }
            }
        }

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ ip: "128.128.128.1" }); // pass

        var hasError = false;
        try {
            validator.validate({}); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.ip.msg.required);
        }
        assert(hasError);
    });

    it("should validate rule of an IPv4 address in strict mode", function() {
        var validator = new Validator({
            ip: {
                type: "ipv4",
                strict: true
            }
        });

        var expected = {
            ip: {
                type: "ipv4",
                required: false,
                strict: true,
                msg: {
                    type: "'ip' must be a valid, non-private and non-reserved IPv4 address.",
                }
            }
        }

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ ip: "128.128.128.1" }); // pass

        var hasError = false;
        try {
            validator.validate({ ip: "127.0.0.1" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.ip.msg.type);
        }
        assert(hasError);

        var hasError2 = false;
        try {
            validator.validate({ ip: "192.168.1.1" }); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.ip.msg.type);
        }
        assert(hasError2);

        var hasError3 = false;
        try {
            validator.validate({ ip: "172.30.1.1" }); // error
        } catch (err) {
            hasError3 = true;
            assert.equal(err.message, expected.ip.msg.type);
        }
        assert(hasError3);

        var hasError4 = false;
        try {
            validator.validate({ ip: "10.0.1.1" }); // error
        } catch (err) {
            hasError4 = true;
            assert.equal(err.message, expected.ip.msg.type);
        }
        assert(hasError4);

        var hasError5 = false;
        try {
            validator.validate({ ip: "0.0.0.0" }); // error
        } catch (err) {
            hasError5 = true;
            assert.equal(err.message, expected.ip.msg.type);
        }
        assert(hasError5);

        var hasError6 = false;
        try {
            validator.validate({ ip: "255.255.1.1" }); // error
        } catch (err) {
            hasError6 = true;
            assert.equal(err.message, expected.ip.msg.type);
        }
        assert(hasError6);
    });

    it("should validate rule an IPv4 address that requires equality to another field", function () {
        var hasError = false;
        try {
            var validator = new Validator({
                ip: "ipv4",
                confirm_ip: {
                    type: "ipv4",
                    equals: "ip",
                }
            });
        } catch (err) {
            hasError = true;
            assert.equal(err.message, "comparing field 'ip' must be defined with type 'ipv4' and is required.");
        }
        assert(hasError);

        var hasError2 = false;
        try {
            var validator = new Validator({
                ip: {
                    type: "ipv6",
                    required: true
                },
                confirm_ip: {
                    type: "ipv4",
                    equals: "ip",
                }
            });
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, "comparing field 'ip' must be defined with type 'ipv4' and is required.");
        }
        assert(hasError2);

        var validator = new Validator({
            ip: {
                type: "ipv4",
                required: true,
                strict: true
            },
            confirm_ip: {
                type: "ipv4",
                equals: "ip",
                strict: true
            }
        });

        var expected = {
            ip: {
                type: "ipv4",
                required: true,
                strict: true,
                msg: {
                    type: "'ip' must be a valid, non-private and non-reserved IPv4 address.",
                    required: "'ip' must be provided."
                }
            },
            confirm_ip: {
                type: "ipv4",
                required: false,
                strict: true,
                equals: "ip",
                msg: {
                    type: "'confirm_ip' must be a valid, non-private and non-reserved IPv4 address.",
                    equals: "The value of 'confirm_ip' must be the same as 'ip'."
                }
            }
        }

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ ip: "8.8.8.8" }); // pass
        validator.validate({ ip: "8.8.8.8", confirm_ip: "8.8.8.8" }); // pass

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
            validator.validate({ ip: "0.0.0.0" }); // error
        } catch (err) {
            hasError4 = true;
            assert.equal(err.message, expected.ip.msg.type);
        }
        assert(hasError4);

        var hasError5 = false;
        try {
            validator.validate({ ip: "8.8.8.8", confirm_ip: "8.8.8.0" }); // error
        } catch (err) {
            hasError5 = true;
            assert.equal(err.message, expected.confirm_ip.msg.equals);
        }
        assert(hasError5);

        var hasError6 = false;
        try {
            validator.validate({ ip: "8.8.8.8", confirm_ip: "0.0.0.0" }); // error
        } catch (err) {
            hasError6 = true;
            assert.equal(err.message, expected.confirm_ip.msg.type);
        }
        assert(hasError6);
    });
});