const jwt = require("jsonwebtoken");
const User = require("../db/models/UserTableModels/master_user_model")
const moment = require('moment-timezone')
const Constants = require("../../constants")

//To generate new access tokens
genTokens = async (userDetailes) => {
    try {
        tokenPayload = { user_id: userDetailes._id, role: userDetailes.role, timezone: userDetailes.timezone }
        let accessToken = jwt.sign(tokenPayload, process.env.SECRET_ACCESS_KEY, {
            expiresIn: `${Constants.TOKEN_EXP}d`,
            algorithm: "HS256",
        });

        //pushing latest updated token into db
        await User.updateOne({ _id: userDetailes._id }, { $push: { tokens: { token: accessToken, timezone: userDetailes.timezone } } })
        let updatedData = await User.findOne({ _id: userDetailes._id })
        tokensData = updatedData.tokens;

        //removing expaired tokens from db
        let updatedTokens = tokensData.filter(function (tokens) {
            return tokens.createdAt >= new Date().getTime();
        })

        //updating valid tokens to db
        await User.updateOne({ _id: userDetailes._id }, { 'tokens': updatedTokens })

        let tokens = { accessToken: accessToken }
        return { status: 200, error: false, data: tokens, message: "Login success" };
    } catch (err) {
        Logger.error(
            `jwt - genTokens - lineno-30, Error: ${err}`
        );
        throw new Error(`Something went wrong while authentication please try later`)
    }
};

//To check req token is valid or not
verifyToken = (req, res, next) => {
    let accessToken = req.headers["authorization"];
    if (!accessToken) {
        res.status(400).send({ status: 400, error: true, isTokenVerified: false, message: `Access token required` });
    } else {
        accessToken = accessToken.split(" ")[1];
        jwt.verify(accessToken, process.env.SECRET_ACCESS_KEY, (err, user) => {
            if (!err) {
                req.user = user;
                next();
            } else if (err.message == "jwt expired") {
                res.status(400).send({ status: 400, error: true, isTokenVerified: false, message: err.message });
            }
            else {
                res.status(400).send({ status: 400, error: true, isTokenVerified: false, message: err.message });
            }
        });
    }
};

module.exports = { genTokens, verifyToken };