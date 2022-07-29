const { PatientSymptoms } = require("../../db/models/index_models")
const mongoose = require('mongoose')
const toId = mongoose.Types.ObjectId

//To insert patient symptoms
exports.insertSymptoms = async (req, res) => {
    try {
        req.body.symptom_id = req.body.symptom_id.map(element => {
            return element = toId(element)
        });
        let symptoms = new PatientSymptoms(req.body)
        var response = await symptoms.save(req.body)
        res.status(201).send({
            status: 200,
            error: false,
            data: `Symptoms added successfully`
        })
    } catch (e) {
        Logger.error(
            `patient_controller - insertSymptoms - lineno-19, Error: ${e}`
        );
        res.status(400).send({
            status: 400,
            error: true,
            errorMsg: e.message
        })
    }
}

//Finding patient symptoms by using appointment id
exports.getSymptomsByappointmentId = async (req, res) => {
    try {
        PatientSymptoms.findOne({ appointment_id: req.params.appointment_id }).populate('symptom_id').exec((err, master_symptoms) => {
            res.status(201).send({
                status: 200,
                error: false,
                data: master_symptoms,
                message: `Data fetched successfully`
            })
        });
    } catch (e) {
        Logger.error(
            `patient_controller - getSymptomsByappointmentId - lineno-41, Error: ${e}`
        );
        res.status(400).send({
            status: 400,
            error: true,
            errorMsg: e.message
        })
    }
}