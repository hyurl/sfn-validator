const assert = require("assert");
const Validator = require("../");

describe("Filter data tests", function () {
    it("should filter data according the the simple rules", function () {
        var validator = new Validator({
            name: "string",
            score: "number"
        });

        var input = {
            name: "Ayon Lee",
            score: 80,
            color: "yellow"
        };

        var result = {
            name: "Ayon Lee",
            score: 80
        };

        assert.deepStrictEqual(validator.filter(input), result);
    });

    it("should filter data according the the rules contain children scopes", function () {
        var validator = new Validator({
            name: {
                type: "object",
                children: {
                    first: {
                        type: "string",
                        required: true
                    },
                    last: "string"
                }
            },
            score: "number",
        });

        var input = {
            name: {
                first: "Ayon",
                last: "Lee",
                nickname: "Ayonium"
            },
            score: 80,
            color: "yellow"
        };

        var result = {
            name: {
                first: "Ayon",
                last: "Lee",
            },
            score: 80
        };

        assert.deepStrictEqual(validator.filter(input), result);
    });
});