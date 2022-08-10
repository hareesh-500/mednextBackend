module.exports = (app) => {
    var router = require("express").Router();
    let user_controller = require("../../controllers/UserController/user_controller")

    //To insert records into user table
    router.post("/signup", user_controller.insert);

    //To get data from users table based on user id
    router.get("/get_data/:user_id", user_controller.getUserData);

    //To save user address
    router.post("/save_address", user_controller.saveAddress)

    app.use("/api/users", router);
};
