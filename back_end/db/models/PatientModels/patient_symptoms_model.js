const mongoose = require("mongoose");
const Schema = mongoose.Schema
const MasterSymptoms = require("../MasterTableModels/master_symptoms_model")
const patientSymptomsSchema = new Schema({
    symptom_id: [{
        type: Schema.Types.ObjectId, ref: 'master_symptoms',
        required: [true, "Description required"],
        trim: true,
    }],
    appointment_id: {
        type: String,
        required: [true, "Code required"],
        trim: true,
    },
    new_symtoms: [{
        type: String,
        trim: true,
    }]
}, { timestamps: true });

//Middleware to invoke, before data saving into db
patientSymptomsSchema.pre("save", async function (next) {
    const symptoms = this;
    var e = {};
    try {
        //To check given symptom ids are vailable or not in master_symptoms table
        let isAvailableInMaster = await MasterSymptoms.count({ _id: { $in: symptoms.symptom_id } })
        if (!(isAvailableInMaster === symptoms.symptom_id.length)) {
            e.message = "symptom id not available in master table"
            throw e
        } else {
            next()
        }

    } catch (err) {
        Logger.error(`patient_symptoms_model - patientSymptomsSchema.pre - lineno-35, Error: ${err}`);
        next(err);
    }
});

const PatientSymptoms = mongoose.model("patient_symptoms", patientSymptomsSchema);

module.exports = PatientSymptoms;