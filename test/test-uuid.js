const assert = require("assert");
const Validator = require("../");

describe("Validate with UUID strings", function () {
    it("should validate rule of a simple UUID string", function () {
        var validator = new Validator({
            id: "uuid"
        });

        var expected = {
            id: {
                type: "uuid",
                required: false,
                msg: {
                    type: "'id' must be a valid UUID string.",
                }
            }
        };

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({}); // pass
        validator.validate({ id: "550e8400-e29b-41d4-a716-446655440000" }); // pass
        validator.validate({ id: "6F9619FF-8B86-D011-B42D-00C04FC964FF" }); // pass

        var hasError = false;
        try {
            validator.validate({ id: "A0-C5-89-59-0A-D3" }); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.id.msg.type);
        }
        assert(hasError);

        var hasError2 = false;
        try {
            validator.validate({ id: "fe80::e1e1:8347:c7d1:1f50" }); // error
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, expected.id.msg.type);
        }
        assert(hasError2);

        var hasError3 = false;
        try {
            validator.validate({ id: " 6F9619FF-8B86-D011-B42D-00C04FC964FF" }); // error
        } catch (err) {
            hasError3 = true;
            assert.equal(err.message, expected.id.msg.type);
        }
        assert(hasError3);

        var hasError4 = false;
        try {
            validator.validate({ id: "6F9619FF-8B86-D011-B42D-00C04FC964FF " }); // error
        } catch (err) {
            hasError4 = true;
            assert.equal(err.message, expected.id.msg.type);
        }
        assert(hasError4);
    });

    it("should validate rule of a required IPv4 address", function () {
        var validator = new Validator({
            id: {
                type: "uuid",
                required: true
            }
        });

        var expected = {
            id: {
                type: "uuid",
                required: true,
                msg: {
                    type: "'id' must be a valid UUID string.",
                    required: "'id' must be provided."
                }
            }
        }

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ id: "6F9619FF-8B86-D011-B42D-00C04FC964FF" }); // pass

        var hasError = false;
        try {
            validator.validate({}); // error
        } catch (err) {
            hasError = true;
            assert.equal(err.message, expected.id.msg.required);
        }
        assert(hasError);
    });

    it("should validate rule an IPv4 address that requires equality to another field", function () {
        var hasError = false;
        try {
            var validator = new Validator({
                id: "uuid",
                confirm_id: {
                    type: "uuid",
                    equals: "id",
                }
            });
        } catch (err) {
            hasError = true;
            assert.equal(err.message, "comparing field 'id' must be defined with type 'uuid' and is required.");
        }
        assert(hasError);

        var hasError2 = false;
        try {
            var validator = new Validator({
                id: {
                    type: "ipv4",
                    required: true
                },
                confirm_id: {
                    type: "uuid",
                    equals: "id",
                }
            });
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, "comparing field 'id' must be defined with type 'uuid' and is required.");
        }
        assert(hasError2);

        var validator = new Validator({
            id: {
                type: "uuid",
                required: true,
            },
            confirm_id: {
                type: "uuid",
                equals: "id",
            }
        });

        var expected = {
            id: {
                type: "uuid",
                required: true,
                msg: {
                    type: "'id' must be a valid UUID string.",
                    required: "'id' must be provided."
                }
            },
            confirm_id: {
                type: "uuid",
                required: false,
                equals: "id",
                msg: {
                    type: "'confirm_id' must be a valid UUID string.",
                    equals: "The value of 'confirm_id' must be the same as 'id'."
                }
            }
        }

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({ id: "550e8400-e29b-41d4-a716-446655440000" }); // pass
        validator.validate({ id: "550e8400-e29b-41d4-a716-446655440000", confirm_id: "550e8400-e29b-41d4-a716-446655440000" }); // pass

        var hasError3 = false;
        try {
            validator.validate({}); // error
        } catch (err) {
            hasError3 = true;
            assert.equal(err.message, expected.id.msg.required);
        }
        assert(hasError3);

        var hasError4 = false;
        try {
            validator.validate({ id: "550e8400-e29b-41d4-a716-446655440000", confirm_id: "6F9619FF-8B86-D011-B42D-00C04FC964FF" }); // error
        } catch (err) {
            hasError4 = true;
            assert.equal(err.message, expected.confirm_id.msg.equals);
        }
        assert(hasError4);
    });
});