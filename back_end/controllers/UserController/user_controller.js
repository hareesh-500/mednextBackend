const { Users, UserAddress } = require("../../db/models/index_models")

//To insert records into user table
exports.insert = async (req, res) => {
    try {
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
        var response = await Users.findOne(whereCond).select(['-password'])
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