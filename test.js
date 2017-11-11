const Validator = require("./");

var validator = new Validator({
    name: {
        type: "string",
        required: true,
        length: [3, 18]
    },
    color: {
        type: "color",
        strict: true,
    },
    ip: {
        type: "ipv4",
        strict: true,
    },
    email: {
        type: "email",
        strict: true,
    },
    url: {
        type: "url",
        strict: true,
    },
    money: "number",
    isbn: "isbn",
    mac: "mac",
    password: {
        type: "string",
        length: [8, 18],
        required: true,
    },
    check_password: {
        required: true,
        type: "string",
        equals: "password",
        msg: {
            required: "%s 必须提供！"
        }
    },
});

var data = {
    name: "Ayon Lee  ",
    email: "i@LOCALHOST.com",
    uuid: "6F9619FF-8B86-D011-B42D-00C04FC964FF",
    money: 200,
    base64: null,
    color: "#ffffff",
    ip: "137.32.0.1",
    url: "http://localhost.com/",
    mac: "44:45:53:54:00:00",
    password: "123456",
    check_password: "123456",
};

console.log(validator.filter(data));

console.log(validator.check(data));