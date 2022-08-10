const mongoose = require("mongoose");
const Schema = mongoose.Schema
const Patients = require("../PatientModels/patient_model")
const MasterProducts = require("../MasterTableModels/master_produscts_model")

const patientHelthprofileSchema = new Schema({
    patient_id: {
        type: Schema.Types.ObjectId, ref: 'patients',
        required: [true, "Patient id required"],
        unique: true,
        trim: true,
    },
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
    }]
}, { timestamps: true });

//To validate data while saving and updating helth profile
const validateData = async (healthProfile) => {
    var e = {};

    //To check given patient id is vailable or not in patients table
    let isPatientAvailable = await Patients.count({ _id: healthProfile.patient_id })

    //To check given related medications ids are vailable or not in master_products table
    let relatedMedicationCount = await MasterProducts.count({ _id: { $in: healthProfile.related_medication } })

    //To check given drug allergies ids are vailable or not in master_products table
    let drugAllergiesCount = await MasterProducts.count({ _id: { $in: healthProfile.drug_allergies } })

    let isRelatedMedicationAvailable = relatedMedicationCount === healthProfile.related_medication.length
    let isDrugAllergiesAvailable = drugAllergiesCount === healthProfile.drug_allergies.length

    if (!isPatientAvailable) {
        e.message = "Patient id not available in master table"
        throw e
    } else if (!isRelatedMedicationAvailable) {
        e.message = "Related medication not available in master table"
        throw e
    } else if (!isDrugAllergiesAvailable) {
        e.message = "Drug allergies not available in master table"
        throw e
    }
}

//Middleware to invoke, before data saving into db
patientHelthprofileSchema.pre("save", async function (next) {
    const healthProfile = this;
    try {
        await validateData(healthProfile)
        next()

    } catch (err) {
        Logger.error(`patient_health_profile_model - patientHealthProfileSchema.pre - lineno-38, Error: ${err}`);
        next(err);
    }
});

//Middleware to invoke, before data updating into db
patientHelthprofileSchema.pre('findOneAndUpdate', async function middleware(next) {
    const healthProfile = this;
    try {
        await validateData(healthProfile._update)
        next()

    } catch (err) {
        Logger.error(`patient_health_profile_model - patientHealthProfileSchema.pre - lineno-74, Error: ${err}`);
        next(err);
    }
})

const PatientHelthprofile = mongoose.model("patient_helth_profile", patientHelthprofileSchema);

module.exports = PatientHelthprofile;