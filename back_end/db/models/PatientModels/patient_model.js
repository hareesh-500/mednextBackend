const mongoose = require("mongoose");
const validator = require("validator");
const Schema = mongoose.Schema
const Users = require("../UserTableModels/master_user_models")
const patientSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId, ref: 'users',
        required: [true, "User id required"],
        trim: true,
    },
    name: {
        type: String,
        required: [true, "Name required"],
        trim: true,
    },
    phone_number: {
        type: String,
        minlength: [10, "phone number should contains  10 digits"],
        maxlength: [10, "phone number should contains  10 digits"],
        validate: {
            validator: function (number) {
                if (number == "0") return true;
                return validator.isMobilePhone(number);
            },
            message: (props) => `${props.value} is not a valid mobile number`,
        },
        required: [true, "phone number required"],
        trim: true,
    },
    email: {
        type: String,
        validate: {
            validator: function (useremail) {
                return validator.isEmail(useremail);
            },
            message: (props) => `${props.value} is not a valide email`,
        },
        required: [true, "email required"],
        trim: true,
    },
    dob: {
        type: Date,
        required: [true, "DOB required"],
        trim: true,
    },
    gender: {
        type: String,
        required: [true, "Gender required"],
        trim: true,
    },
    relation: {
        type: String,
        required: [true, "Relation required"],
        trim: true,
    },
}, { timestamps: true });

//Middleware to invoke, before data saving into db
patientSchema.pre("save", async function (next) {
    const patient = this;
    var e = {};
    try {
        //To check given symptom ids are vailable or not in master_symptoms table
        console.log("Users..", Users)
        let usersCount = await Users.count({ _id: { $in: patient.user_id } })
        if (!usersCount) {
            e.message = "User id not available in master table"
            throw e
        } else {
            next()
        }
    } catch (err) {
        Logger.error(`patient_model - patientSchema.pre - lineno-71, Error: ${err}`);
        next(err);
    }
});

const Patients = mongoose.model("patients", patientSchema);

module.exports = Patients;