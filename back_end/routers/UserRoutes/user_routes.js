module.exports = (app) => {
    var router = require("express").Router();
    let user_controller = require("../../controllers/UserController/user_controller")
    const { verifyToken } = require("../../config/Jwt")

    //To insert records into user table
    router.post("/signup", user_controller.insert);

    //To login user
    router.post("/login", user_controller.login)

    //To get data from users table based on user id
    router.get("/get_data/:user_id", user_controller.getUserData);

    //To save user address
    router.post("/save_address", user_controller.saveAddress)

    //To verify user otp
    router.post("/verify_otp", user_controller.verifyOtp)

    //To resend user otp
    router.post("/resend_otp", user_controller.resendOtp)

    //To check Token is valid
    router.post("/verify_token", verifyToken, user_controller.verifyToken)

    app.use("/api/users", router);
};
