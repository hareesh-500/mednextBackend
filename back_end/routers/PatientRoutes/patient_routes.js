module.exports = (app) => {
    var router = require("express").Router();
    let user_controller = require("../../controllers/PtientController/patient_controller")

    //To insert patient symptoms
    router.post("/insert_symptoms", user_controller.insertSymptoms)

    //Finding patient symptoms by using appointment id
    router.get("/get_symptoms/:appointment_id", user_controller.getSymptomsByappointmentId)

    app.use("/api/patient", router);
};
