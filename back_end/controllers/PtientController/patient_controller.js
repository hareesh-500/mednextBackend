const { Patients, PatientIntakeProcess, PatientAppointments, AppointmentTransactions, MasterSymptoms, MasterProducts, PatientHelthprofile } = require("../../db/models/index_models")
const mongoose = require('mongoose')
const toId = mongoose.Types.ObjectId

//To save patient relatives
exports.savePatients = async (req, res) => {
    try {
        let err = {}
        err.message = "User id required"
        if (!req.body.user_id) throw err
        let patients = new Patients(req.body)
        var response = await patients.save(req.body)
        res.status(201).send({
            status: 200,
            error: false,
            data: `User added successfully`
        })
    } catch (e) {
        Logger.error(
            `patient_controller - getSymptomsByappointmentId - lineno-19, Error: ${e}`
        );
        res.status(400).send({
            status: 400,
            error: true,
            errorMsg: e.message
        })
    }
}

//To save patient intake process
const saveIntakeProcess = async (reqData) => {
    try {
        let patientIntakeProcess = new PatientIntakeProcess(reqData)
        var response = await patientIntakeProcess.save(reqData)
        return response
    } catch (e) {
        Logger.error(
            `patient_controller - saveIntakeProcess - lineno-37, Error: ${e}`
        );
        throw e
    }
}

//To save patient intake process
const saveAppointmentTransactions = async (reqData) => {
    try {
        let appointmentTransactions = new AppointmentTransactions(reqData)
        var response = await appointmentTransactions.save(reqData)
        return response
    } catch (e) {
        Logger.error(
            `patient_controller - saveAppointmentTransactions - lineno-51, Error: ${e}`
        );
        throw e
    }
}

//To save patient appointment
exports.saveAppointment = async (req, res) => {
    try {
        //extracting intake data
        const { patient_id, symptoms, new_symtoms, long_term_illness, related_medication, drug_allergies, medical_records } = req.body
        let intakeData = { patient_id, symptoms, new_symtoms, long_term_illness, related_medication, drug_allergies, medical_records }

        //extracting transaction data
        const { doctor_discount_amount, doctor_discount_type, coupon_id, coupon_discount_type, coupon_discount_amount, doctor_fee, payble_amount, transaction_id } = req.body
        let transactionData = { doctor_discount_amount, doctor_discount_type, coupon_id, coupon_discount_type, coupon_discount_amount, doctor_fee, payble_amount, transaction_id }

        let removedKeys = ["symptoms", "new_symtoms", "long_term_illness", "related_medication", "drug_allergies", "medical_records", "doctor_discount_amount", "doctor_discount_type", "coupon_id", "coupon_discount_type", "coupon_discount_amount", "doctor_fee,payble_amount", "transaction_id"]
        removedKeys.forEach(key => delete req.body[key]);
        let patientAppointments = new PatientAppointments(req.body)
        //saving appointment
        var appointmentResponse = await patientAppointments.save(req.body)

        //saving intake process
        intakeData.appointment_id = appointmentResponse._id
        await saveIntakeProcess(intakeData)

        //saving transaction data
        transactionData.appointment_id = appointmentResponse._id
        await saveAppointmentTransactions(transactionData)

        res.status(201).send({
            status: 200,
            error: false,
            message: `Appointment created successfully`
        })
    } catch (e) {
        Logger.error(
            `patient_controller - saveAppointment - lineno-89, Error: ${e}`
        );
        if (appointmentResponse) await PatientAppointments.findOneAndRemove({ _id: appointmentResponse._id })
        res.status(400).send({
            status: 400,
            error: true,
            errorMsg: e.message
        })
    }

}

//To get appointment data
exports.getAppointment = async (req, res) => {
    try {
        let response = await PatientAppointments.aggregate([
            {
                $match: { '_id': { $eq: toId(req.params.appointment_id) } }
            },
            {
                $lookup:
                {
                    from: Patients.collection.name,
                    localField: "patient_id",
                    foreignField: "_id",
                    as: "patient"
                },
            },
            {
                $lookup:
                {
                    from: PatientIntakeProcess.collection.name,
                    localField: "_id",
                    foreignField: "appointment_id",
                    as: "intakedata"
                },
            },
            {
                $lookup:
                {
                    from: MasterSymptoms.collection.name,
                    localField: "intakedata.symptoms",
                    foreignField: "_id",
                    as: "symptoms"
                },
            },
            {
                $lookup:
                {
                    from: MasterProducts.collection.name,
                    localField: "intakedata.related_medication",
                    foreignField: "_id",
                    as: "related_medication"
                },
            },
            {
                $lookup:
                {
                    from: MasterProducts.collection.name,
                    localField: "intakedata.drug_allergies",
                    foreignField: "_id",
                    as: "drug_allergies"
                },
            },
            {
                $lookup:
                {
                    from: AppointmentTransactions.collection.name,
                    localField: "_id",
                    foreignField: "appointment_id",
                    as: "transactionData"
                }
            },
            { $unset: ["intakedata.symptoms", "intakedata.long_term_illness", "intakedata.related_medication", "intakedata.drug_allergies", "intakedata.appointment_id", "transactionData.appointment_id", "createdAt", "updatedAt", "patient.createdAt", "patient.updatedAt"] },
            {
                $project: { "patient": 1, "symptoms._id": 1, "symptoms.description": 1, "intakedata": 1, "transactionData": 1, "related_medication._id": 1, "related_medication.medicine_id": 1, "related_medication.medicine_name": 1, "drug_allergies._id": 1, "drug_allergies.medicine_id": 1, "drug_allergies.medicine_name": 1 }
            },
        ])
        res.status(201).send({
            status: 200,
            error: false,
            data: response[0]
        })
    } catch (e) {
        Logger.error(
            `patient_controller - getAppointment - lineno-164, Error: ${e}`
        );
        res.status(400).send({
            status: 400,
            error: true,
            errorMsg: e.message
        })
    }
}

//To save patient helth profile
exports.saveHelthProfile = async (req, res) => {
    try {
        let patientHelthprofile = ""
        if (req.body.id) {
            patientHelthprofile = await PatientHelthprofile.findOneAndUpdate({ _id: req.body.id }, req.body, { new: true });
        } else {
            patientHelthprofile = new PatientHelthprofile(req.body)
            var response = await patientHelthprofile.save(req.body)
        }
        res.status(201).send({
            status: 200,
            error: false,
            message: "Helth profile saved successfully"
        })
    } catch (e) {
        Logger.error(
            `patient_controller - saveHelthProfile - lineno-197, Error: ${e}`
        );
        res.status(400).send({
            status: 400,
            error: true,
            errorMsg: e.message
        })
    }
}