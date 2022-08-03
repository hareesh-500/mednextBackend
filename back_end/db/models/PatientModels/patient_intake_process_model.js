const mongoose = require("mongoose");
const Schema = mongoose.Schema
const Patients = require("../PatientModels/patient_model")
const MasterProducts = require("../MasterTableModels/master_produscts_model")
const MasterSymptoms = require("../MasterTableModels/master_symptoms_model")
const patientIntakeProcessSchema = new Schema({
    appointment_id: {
        type: Schema.Types.ObjectId, ref: 'patient_appointments',
        required: [true, "Appointment id required"],
        trim: true,
    },
    patient_id: {
        type: Schema.Types.ObjectId, ref: 'patients',
        required: [true, "Patient id required"],
        trim: true,
    },
    symptoms: [{
        type: Schema.Types.ObjectId, ref: 'master_symptoms',
        required: [true, "Description required"],
        trim: true,
    }],
    new_symtoms: [{
        type: String,
        trim: true,
    }],
    vitals: [{
        height: {
            type: String,
            default: null,
            trim: true,
        },
        weight: {
            type: String,
            default: null,
            trim: true,
        },
        BMI: {
            type: String,
            default: null,
            trim: true,
        },
        temperature: {
            type: String,
            default: null,
            trim: true,
        },
        pulse: {
            type: String,
            default: null,
            trim: true,
        },
        blood_sugar: {
            type: String,
            default: null,
            trim: true,
        },
        respiratory_rate: {
            type: String,
            default: null,
            trim: true,
        },
        systolic: {
            type: String,
            default: null,
            trim: true,
        },
        diastolic: {
            type: String,
            default: null,
            trim: true,
        },
    }],
    long_term_illness: [{
        type: String,
        trim: true,
    }],
    related_medication: [{
        type: Schema.Types.ObjectId, ref: 'master_products',
        trim: true,
    }],
    drug_allergies: [{
        type: Schema.Types.ObjectId, ref: 'master_products',
        trim: true,
    }],
    medical_records: [{
        type: String,
        trim: true,
    }]
}, { timestamps: true });

//Middleware to invoke, before data saving into db
patientIntakeProcessSchema.pre("save", async function (next) {
    const healthProfile = this;
    var e = {};
    try {

        //To check given patient id is vailable or not in patients table
        let isPatientAvailable = await Patients.count({ _id: healthProfile.patient_id })

        //To check given related medications ids are vailable or not in master_products table
        let relatedMedicationCount = await MasterProducts.count({ _id: { $in: healthProfile.related_medication } })

        //To check given drug allergies ids are vailable or not in master_products table
        let drugAllergiesCount = await MasterProducts.count({ _id: { $in: healthProfile.drug_allergies } })

        //To check given symptom ids are vailable or not in master_symptoms table
        let symptomsCount = await MasterSymptoms.count({ _id: { $in: healthProfile.symptoms } })

        let isSymptomsAvailable = symptomsCount === healthProfile.symptoms.length
        let isRelatedMedicationAvailable = relatedMedicationCount === healthProfile.related_medication.length
        let isDrugAllergiesAvailable = drugAllergiesCount === healthProfile.drug_allergies.length
        if (!isPatientAvailable || !isRelatedMedicationAvailable || !isDrugAllergiesAvailable || !isSymptomsAvailable) {
            if (!isPatientAvailable) {
                e.message = "Patient id not available in master table"
                throw e
            } else if (!isSymptomsAvailable) {
                e.message = "symptoms not available in master table"
                throw e
            } else if (!isRelatedMedicationAvailable) {
                e.message = "Related medication not available in master table"
                throw e
            } else if (!isDrugAllergiesAvailable) {
                e.message = "Drug allergies not available in master table"
                throw e
            }
        } else {
            next()
        }

    } catch (err) {
        Logger.error(`patient_health_profile_model - patientHealthProfileSchema.pre - lineno-38, Error: ${err}`);
        next(err);
    }
});

const PatientIntakeProcess = mongoose.model("patient_intake_process", patientIntakeProcessSchema);

module.exports = PatientIntakeProcess;