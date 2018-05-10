const assert = require("assert");
const Validator = require("../");

describe("Validate with objects", function () {
    it("should validate rule of an object that carries children fields", function () {
        var hasError = false;
        try {
            var validator = new Validator({
                scope: "object"
            });
        } catch (err) {
            hasError = true;
            assert.equal(err.message, "'scope' must contain children rules.");
        }
        assert(hasError);

        var hasError2 = false;
        try {
            var validator = new Validator({
                scope: {
                    type: "object",
                    children: {
                        name: "unknown",
                    }
                }
            });
        } catch (err) {
            hasError2 = true;
            assert.equal(err.message, "type 'unknown' of 'scope.children.name' is invalid.");
        }
        assert(hasError2);

        var hasError3 = false;
        try {
            var validator = new Validator({
                scope: {
                    type: "object",
                    children: {
                        name: "string",
                        score: {
                            type: "number",
                            range: 100
                        }
                    }
                }
            });
        } catch (err) {
            hasError3 = true;
            assert.equal(err.message, "'scope.children.score' must be an array that contains only 2 numbers.");
        }
        assert(hasError3);

        var hasError4 = false;
        try {
            var validator = new Validator({
                scope: {
                    type: "object",
                    children: {
                        name: "string",
                        score: {
                            type: "number",
                            range: [0, 100],
                            msg: true
                        }
                    }
                }
            });
        } catch (err) {
            hasError4 = true;
            assert.equal(err.message, "'scope.children.score.msg' must be a string or an object.");
        }
        assert(hasError4);

        var hasError5 = false;
        try {
            var validator = new Validator({
                scope: {
                    type: "object",
                    children: {
                        name: "string",
                        score: {
                            type: "number",
                            range: [0, 100]
                        },
                        confirm_name: {
                            type: "string",
                            equals: "name"
                        },
                    }
                }
            });
        } catch (err) {
            hasError5 = true;
            assert.equal(err.message, "comparing field 'scope.children.name' must be defined with type 'string' and is required.");
        }
        assert(hasError5);

        var validator = new Validator({
            scope: {
                type: "object",
                children: {
                    name: {
                        type: "string",
                        required: true
                    },
                    score: {
                        type: "number",
                        range: [0, 100]
                    },
                    confirm_name: {
                        type: "string",
                        equals: "name"
                    },
                }
            }
        });

        var expected = {
            scope: {
                type: "object",
                required: false,
                msg: {
                    type: "'scope' must be a valid object."
                },
                children: {
                    name: {
                        type: "string",
                        required: true,
                        msg: {
                            type: "'scope.name' must be a valid string.",
                            required: "'scope.name' must be provided."
                        }
                    },
                    score: {
                        type: "number",
                        required: false,
                        strict: true,
                        range: [0, 100],
                        msg: {
                            type: "'scope.score' must be a valid number.",
                            range: "The value of 'scope.score' must between 0 and 100."
                        }
                    },
                    confirm_name: {
                        type: "string",
                        required: false,
                        equals: "name",
                        msg: {
                            type: "'scope.confirm_name' must be a valid string.",
                            equals: "The value of 'scope.confirm_name' must be the same as 'scope.name'."
                        }
                    }
                }
            }
        }

        assert.deepStrictEqual(validator.rules, expected);
        validator.validate({}); // pass
        validator.validate({ // pass
            scope: {
                name: "Ayon Lee",
                score: 99,
                confirm_name: "Ayon Lee"
            }
        });

        var hasError6 = false;
        try {
            validator.validate({
                scope: {
                    name: 123,
                    score: 99,
                    confirm_name: "Ayon Lee"
                }
            });
        } catch (err) {
            hasError6 = true;
            assert.equal(err.message, expected.scope.children.name.msg.type);
        }
        assert(hasError6);

        var hasError7 = false;
        try {
            validator.validate({
                scope: {
                    score: 99,
                    confirm_name: "Ayon Lee"
                }
            });
        } catch (err) {
            hasError7 = true;
            assert.equal(err.message, expected.scope.children.name.msg.required);
        }
        assert(hasError7);

        var hasError8 = false;
        try {
            validator.validate({
                scope: {
                    name: "Ayon Lee",
                    score: 101,
                    confirm_name: "Ayon Lee"
                }
            });
        } catch (err) {
            hasError8 = true;
            assert.equal(err.message, expected.scope.children.score.msg.range);
        }
        assert(hasError8);

        var hasError9 = false;
        try {
            validator.validate({
                scope: {
                    name: "Ayon Lee",
                    score: "99",
                    confirm_name: "Ayon Lee"
                }
            });
        } catch (err) {
            hasError9 = true;
            assert.equal(err.message, expected.scope.children.score.msg.type);
        }
        assert(hasError9);

        var hasError10 = false;
        try {
            validator.validate({
                scope: {
                    name: "Ayon Lee",
                    score: 99,
                    confirm_name: 123
                }
            });
        } catch (err) {
            hasError10 = true;
            assert.equal(err.message, expected.scope.children.confirm_name.msg.type);
        }
        assert(hasError10);

        var hasError11 = false;
        try {
            validator.validate({
                scope: {
                    name: "Ayon Lee",
                    score: 99,
                    confirm_name: "Ayon Lee "
                }
            });
        } catch (err) {
            hasError11 = true;
            assert.equal(err.message, expected.scope.children.confirm_name.msg.equals);
        }
        assert(hasError11);
    });
});