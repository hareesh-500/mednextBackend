const mongoose = require("mongoose");

const masterCitiesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name required"],
        trim: true,
    },
    state_id: {
        type: String,
        required: [true, "State id required"],
        trim: true,
    },

}, { timestamps: true });

const MasterCities = mongoose.model("master_cities", masterCitiesSchema);

module.exports = MasterCities;