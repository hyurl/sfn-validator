
import { parseRule, filter, validate, replaceError } from "./util";

/**
 * Simple Friendly Node.js Validator.
 */
class Validator {
    rules: { [field: string]: Validator.Rule };

    /**
     * Creates a validator with specified rules.
     */
    constructor(rules: { [field: string]: string | Validator.Rule }) {
        try {
            this.rules = parseRule(rules);
        } catch (err) {
            throw replaceError(err, "new Validator"); // re-throw error.
        }
    }

    /** Filters input data according to the rules (doesn't validate). */
    filter(data: any) {
        return filter(this.rules, data);
    }

    /** Checks if the input data are all valid. */
    validate(data: any) {
        try {
            return validate(this.rules, data);
        } catch (err) {
            throw replaceError(err, "Validator.validate"); // re-throw error.
        }
    }

    /** An alias of `validate()`.  */
    check(data: any) {
        try {
            return validate(this.rules, data);
        } catch (err) {
            throw replaceError(err, "Validator.check"); // re-throw error.
        }
    }
}

namespace Validator {
    export type Message = {
        type?: string;
        required?: string;
        equals?: string;
        length?: string;
        range?: string;
    };

    export interface Rule {
        type: string;
        required?: boolean;
        /**
         * For types `string`, `email`, `url`, `ascii`, `base64`, `json` and 
         * `array`, a number sets an exact length, or an array sets the 
         * minimum and maximum length.
         */
        length?: number | [number, number];
        /**
         * For `number`, an array set the range (minimum and maximum) of the 
         * data value.
         */
        range?: [number, number];
        /**
         * For types `number`, `email`, `url`, `color`, `ipv4`, `isbn`, it's 
         * `false` by default for most types except `number`.
         */
        strict?: boolean;
        /** The value of this field should be equal to the given field's. */
        equals?: string;
        /** Customize the error message. */
        msg?: string | Message;
        children?: { [field: string]: string | Rule };
    }
}

export = Validator;