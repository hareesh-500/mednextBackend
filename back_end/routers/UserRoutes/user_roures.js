module.exports = (app) => {
    var router = require("express").Router();
    let user_controller = require("../../controllers/user_controller")
    //const { verifyToken } = require("../config/Jwt");

    router.post("/insert_user_data", user_controller.insert);
    router.get("/get_data/:id", user_controller.getData);

    app.use("/api/users", router);
};
