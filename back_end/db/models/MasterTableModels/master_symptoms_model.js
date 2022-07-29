const mongoose = require("mongoose");

const masterSymptomsSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, "Description required"],
        trim: true,
    },
    code: {
        type: String,
        required: [true, "Code required"],
        trim: true,
    },
    infermedica_id: {
        type: String,
        required: [true, "Infermedica id number required"],
        trim: true,
    },
    body_part_name: {
        type: String,
        required: [true, "Body part name required"],
        trim: true,
    },
    body_part_id: {
        type: String,
        required: [true, "Body part id required"],
        trim: true,
    },
    sex: {
        type: String,
        required: [true, "Sex required"],
        trim: true,
    },
}, { timestamps: true });

const MasterSymptoms = mongoose.model("master_symptoms", masterSymptomsSchema);

module.exports = MasterSymptoms;