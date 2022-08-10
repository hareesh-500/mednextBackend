module.exports = (app) => {
    var router = require("express").Router();
    let user_controller = require("../../controllers/PtientController/patient_controller")

    //To save patient relatives
    router.post("/save_patients", user_controller.savePatients)

    //To save patient appointment
    router.post("/save_appointment", user_controller.saveAppointment)

    //To get appointment data
    router.get("/get_appointment/:appointment_id", user_controller.getAppointment)

    //To save patient helth profile
    router.post("/save_helth_profile", user_controller.saveHelthProfile)

    app.use("/api/patient", router);
};
