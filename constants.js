'use strict';

let constants = {
    OTP_EXPTIME: 20, //mins
    TOKEN_EXP: 1 //days
};

module.exports = Object.freeze(constants); // freeze prevents changes by users