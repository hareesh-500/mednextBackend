const mongoose = require("mongoose");

const masterCountriesSchema = new mongoose.Schema({
    short_name: {
        type: String,
        required: [true, "Short name id required"],
        trim: true,
    },
    name: {
        type: String,
        required: [true, "Name required"],
        trim: true,
    },
    pincode: {
        type: String,
        required: [true, "Pincode required"],
        trim: true,
    },
    code: {
        type: String,
        required: [true, "Code required"],
        trim: true,
    },
    dial_code: {
        type: String,
        required: [true, "Dial code required"],
        trim: true,
    },
    currency_name: {
        type: String,
        required: [true, "Currency name required"],
        trim: true,
    },
    currency_symbol: {
        type: String,
        required: [true, "Currency symbol required"],
        trim: true,
    },
    currency_code: {
        type: String,
        default: null,
        trim: true,
    },

}, { timestamps: true });

const MasterCountries = mongoose.model("master_countries", masterCountriesSchema);

module.exports = MasterCountries;