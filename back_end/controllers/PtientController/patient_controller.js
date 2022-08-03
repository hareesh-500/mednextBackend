const { Patients, PatientIntakeProcess, PatientAppointments, AppointmentTransactions, MasterSymptoms } = require("../../db/models/index_models")
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
            `patient_controller - getSymptomsByappointmentId - lineno-41, Error: ${e}`
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
            `patient_controller - saveIntakeProcess - lineno-114, Error: ${e}`
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
            `patient_controller - saveAppointment - lineno-67, Error: ${e}`
        );
        console.log("appointmentResponse._id", appointmentResponse._id)
        if (appointmentResponse) await PatientAppointments.findOneAndRemove({ _id: appointmentResponse._id })
        res.status(400).send({
            status: 400,
            error: true,
            errorMsg: e.message
        })
    }

}


exports.getAppointment = async (req, res) => {

    // let response = await PatientIntakeProcess.find({ appointment_id: req.params.appointment_id }).populate({ path: 'related_medication', select: 'medicine_name' }).exec();
    console.log("response..", req.params.appointment_id)

    let response = await PatientAppointments.aggregate([
        {
            $match: { '_id': { $eq: toId(req.params.appointment_id) } }
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
        { $unwind: "$intakedata[0].symptoms" },
        {
            "$lookup": {
                "from": MasterSymptoms.collection.name,
                "let": { "symptom_id": "$intakedata.symptoms" },
                "pipeline": [
                    { "$unwind": "$_id" },
                    { "$match": { "$expr": { "$eq": ["$$symptom_id", "$_id"] } } }
                ],
                "as": "item"
            }
        },
        // {
        //     $lookup:
        //     {
        //         from: MasterSymptoms.collection.name,
        //         localField: "intakedata.symptoms",
        //         foreignField: "_id",
        //         as: "sym"
        //     },
        // },
        {
            $lookup:
            {
                from: AppointmentTransactions.collection.name,
                localField: "_id",
                foreignField: "appointment_id",
                as: "transactionData"
            }
        }
    ])
    // , {
    //         path: 'symptoms',
    //         // match: { age: { $gte: 21 } },
    //         // // Explicitly exclude `_id`, see http://bit.ly/2aEfTdB
    //         // select: 'name -_id'
    //     }, {
    //         path: 'related_medication',
    //         // match: { age: { $gte: 21 } },
    //         // // Explicitly exclude `_id`, see http://bit.ly/2aEfTdB
    //         // select: 'name -_id'
    //     }, {
    //         path: 'drug_allergies',
    //         // match: { age: { $gte: 21 } },
    //         // // Explicitly exclude `_id`, see http://bit.ly/2aEfTdB
    //         // select: 'name -_id'
    //     }).
    res.status(201).send({
        status: 200,
        error: false,
        data: response[0]
    })
}