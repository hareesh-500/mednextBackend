const mongoose = require("mongoose");

const masterStatesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Medicine id required"],
        trim: true,
    },
    country_id: {
        type: Number,
        required: [true, "Medicine name required"],
        trim: true,
    },
    m_id: {
        type: Number,
        required: [true, "m_id required"],
        trim: true,
    }

}, { timestamps: true });

const MasterStates = mongoose.model("master_states", masterStatesSchema);

module.exports = MasterStates;