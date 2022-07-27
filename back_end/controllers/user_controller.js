const User = require("../db/models/UserModels/user_models")


//To insert records into a user table
exports.insert = async (req, res) => {
    try {
        let insert = new User(req.body)
        var response = await insert.save(req.body)
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

exports.getData = async (req, res) => {
    try {
        let whereCond = { _id: req.params.id }
        var response = await User.findOne(whereCond)
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