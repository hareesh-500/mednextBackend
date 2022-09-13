const { Users, UserAddress } = require("../../db/models/index_models")
const generateOtp = require("../../helpers/generateOtp")
const moment = require('moment-timezone')
const Constants = require("../../../constants")
const cipher = require("../../helpers/cipher")
const Email = require("../../helpers/emails")
const Jwt = require("../../config/Jwt")

//To insert records into user table
exports.insert = async (req, res) => {
    try {
        req.body.otp = generateOtp.generate(6)
        req.body.otp_exp_time = moment().add(Constants.OTP_EXPTIME, 'minutes').format('YYYY-MM-DD LTS')
        let users = new Users(req.body)
        var response = await users.save(req.body)
        Email.sendEmail(req.body.email, "Sign Up Verification", `use ${req.body.otp} to verify your registration`)
        res.status(201).send({
            status: 200,
            error: false,
            message: `Registration successfull Otp will be sent to ur registered email id`
        })
    } catch (e) {
        Logger.error(
            `user_controller - insert - lineno-23, Error: ${e}`
        );
        res.status(400).send({
            status: 400,
            error: true,
            errorMsg: e.message
        })
    }
}

//To login user
exports.login = async (req, res) => {
    try {
        if (!req.body.user_name || !req.body.role) {
            let e = {}
            e.message = "user_name and role required"
            throw e
        }
        let username = req.body.user_name
        let userRole = req.body.role
        let encryptUsername = cipher.encrypt(username)
        const user = await Users.findOne({ "$or": [{ phone_number: encryptUsername }, { email: encryptUsername }] })
        //checking user registered or not
        if (!user) res.status(401).send({ status: 401, error: true, message: "User not registered with us" });

        //checking user credentials
        else if (!user.role.includes(userRole)) res.status(401).send({ status: 401, error: true, message: "Invalid login or password." });

        else {
            //To set otp
            let updateData = {
                otp: generateOtp.generate(6),
                otp_exp_time: moment().add(Constants.OTP_EXPTIME, 'minutes').format('YYYY-MM-DD LTS')
            }
            let userId = encryptUsername
            await Users.findOneAndUpdate({ $or: [{ email: userId }, { phone_number: userId }] }, updateData, { new: true });

            Email.sendEmail(username, "Login Verification", `use ${updateData.otp} to verify your Login`)
            res.status(200).send({
                status: 200,
                error: false,
                message: `Login successfull Otp will be sent to your email id`
            })
        }
    } catch (e) {
        Logger.error(
            `user_controller - login - lineno-67, Error: ${e}`
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
            `user_controller - getUserData - lineno-90, Error: ${e}`
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
            `user_controller - saveAddress - lineno-117, Error: ${e}`
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
        let userRole = cipher.encrypt(req.body.role)
        var response = await Users.findOne({
            $and: [
                { $or: [{ email: userId }, { phone_number: userId }] },
                { $and: [{ role: { $in: [userRole] } }] }
            ]
        })
        let otp = ""
        let otpExp = ""
        let isOtpExpired = ""
        let token = ""
        let isOtpVerified = false
        let responseMessage = ""
        if (response) {
            otp = cipher.decrypt(response.otp)
            otpExp = response.otp_exp_time
            isOtpVerified = otp === req.body.otp
            isOtpExpired = new Date(otpExp).getTime() > new Date().getTime()
            if (!isOtpVerified) {
                responseMessage = `OTP miss match`
            } else if (!isOtpExpired) {
                isOtpVerified = false
                responseMessage = `OTP expired`
            } else {
                let userDetails = { _id: response._id, role: req.body.role, timezone: req.body.timezone }
                let tokenData = await Jwt.genTokens(userDetails)
                token = tokenData.data.accessToken
                responseMessage = `OTP verified successfully`
            }
        } else {
            let e = {}
            e.message = "User not found"
            throw e
        }
        res.status(201).send({
            status: 200,
            error: false,
            token: token,
            isOtpVerified: isOtpVerified,
            message: `${responseMessage}`
        })
    } catch (e) {
        Logger.error(
            `user_controller - verifyOtp - lineno-181, Error: ${e}`
        );
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
            Email.sendEmail(req.body.user_id, "Sign Up Verification", `use ${updateData.otp} to verify your registration`)
            responseMessage = `OTP sent successfully`
        } else {
            let e = {}
            e.message = "User not found"
            throw e
        }
        res.status(201).send({
            status: 200,
            error: false,
            message: `${responseMessage}`
        })
    } catch (e) {
        Logger.error(
            `user_controller - resendOtp - lineno-220, Error: ${e}`
        );
        res.status(400).send({
            status: 400,
            error: true,
            errorMsg: e.message
        })
    }
}

//To check Token is valid
exports.verifyToken = async (req, res) => {
    res.status(200).send({
        status: 200,
        error: false,
        isTokenVerified: true,
        data: `Token verified successfully`
    })
}