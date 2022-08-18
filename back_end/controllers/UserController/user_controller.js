const { Users, UserAddress } = require("../../db/models/index_models")
const generateOtp = require("../../helpers/generateOtp")
const moment = require('moment-timezone')
const Constants = require("../../../constants")
const cipher = require("../../helpers/cipher")

//To insert records into user table
exports.insert = async (req, res) => {
    try {

        req.body.otp = generateOtp.generate(6)
        req.body.otp_exp_time = moment().add(Constants.OTP_EXPTIME, 'minutes').format('YYYY-MM-DD LTS')
        let users = new Users(req.body)
        var response = await users.save(req.body)
        res.status(201).send({
            status: 200,
            error: false,
            data: `Data successfully inserted into User table`
        })
    } catch (e) {
        Logger.error(
            `user_login.controller - insert - lineno-33, Error: ${e}`
        );
        res.status(400).send({
            status: 400,
            error: true,
            errorMsg: e.message
        })
    }
}

//To get data from users table based on user id
exports.getUserData = async (req, res) => {
    try {
        let whereCond = { _id: req.params.user_id }
        var response = await Users.findOne(whereCond).select(['-otp', '-otp_exp_time'])
        res.status(201).send({
            status: 200,
            error: false,
            data: response,
            message: `Data fetched successfully`
        })
    } catch (e) {
        Logger.error(
            `user_login.controller - insert - lineno-33, Error: ${e}`
        );
        res.status(400).send({
            status: 400,
            error: true,
            errorMsg: e.message
        })
    }
}

//To save user address
exports.saveAddress = async (req, res) => {
    try {
        let userAddress = ""
        if (req.body.id) {
            userAddress = await UserAddress.findOneAndUpdate({ _id: req.body.id }, req.body, { new: true });
        } else {
            userAddress = new UserAddress(req.body)
            var response = await userAddress.save(req.body)
        }
        res.status(201).send({
            status: 200,
            error: false,
            data: `Address saved successfully`
        })
    } catch (e) {
        Logger.error(
            `user_login.controller - saveAddress - lineno-65, Error: ${e}`
        );
        res.status(400).send({
            status: 400,
            error: true,
            errorMsg: e.message
        })
    }
}

//To verify user otp
exports.verifyOtp = async (req, res) => {
    try {
        if (!req.body.user_id || !req.body.otp) {
            let e = {}
            e.message = "user_id and otp required"
            throw e
        }
        let userId = cipher.encrypt(req.body.user_id)
        var response = await Users.findOne({ $or: [{ email: userId }, { phone_number: userId }] })
        let otp = ""
        let otpExp = ""
        let isOtpExpired = ""
        let isOtpVerified = false
        let responseMessage = ""
        if (response) {
            otp = cipher.decrypt(response.otp)
            console.log("otp...", otp)
            otpExp = response.otp_exp_time
            isOtpVerified = otp === req.body.otp
            isOtpExpired = new Date(otpExp).getTime() > new Date().getTime()
            if (!isOtpVerified) {
                responseMessage = `OTP miss match`
            } else if (!isOtpExpired) {
                isOtpVerified = false
                responseMessage = `OTP expired`
            } else {
                responseMessage = `OTP verified successfully`
            }
        } else {
            responseMessage = "User not found"
        }
        res.status(201).send({
            status: 200,
            error: false,
            isOtpVerified: isOtpVerified,
            message: `${responseMessage}`
        })
    } catch (e) {
        Logger.error(
            `user_login.controller - insert - lineno-33, Error: ${e}`
        );
        console.log("e....", e)
        res.status(400).send({
            status: 400,
            error: true,
            errorMsg: e.message
        })
    }
}

//To resend user otp
exports.resendOtp = async (req, res) => {
    try {
        if (!req.body.user_id) {
            let e = {}
            e.message = "user_id required"
            throw e
        }
        let updateData = {
            otp: generateOtp.generate(6),
            otp_exp_time: moment().add(Constants.OTP_EXPTIME, 'minutes').format('YYYY-MM-DD LTS')
        }
        let userId = cipher.encrypt(req.body.user_id)
        var response = await Users.findOneAndUpdate({ $or: [{ email: userId }, { phone_number: userId }] }, updateData, { new: true });
        if (response) {
            responseMessage = `OTP sent successfully`
        } else {
            responseMessage = "User not found"
        }
        res.status(201).send({
            status: 200,
            error: false,
            message: `${responseMessage}`
        })
    } catch (e) {
        Logger.error(
            `user_login.controller - insert - lineno-33, Error: ${e}`
        );
        res.status(400).send({
            status: 400,
            error: true,
            errorMsg: e.message
        })
    }
}