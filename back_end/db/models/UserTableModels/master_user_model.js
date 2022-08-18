const mongoose = require("mongoose");
const Schema = mongoose.Schema
const validator = require("validator");
const cipher = require("../../../helpers/cipher")

const userSchema = new Schema({
    phone_number: {
        type: String,
        unique: true,
        minlength: [10, "phone number should contains  10 digits"],
        maxlength: [10, "phone number should contains  10 digits"],
        validate: {
            validator: function (number) {
                return validator.isMobilePhone(number);
            },
            message: (props) => `${props.value} is not a valid mobile number`,
        },
        required: [true, "phone number required"],
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        validate: {
            isAsync: true,
            validator: function (email) {
                if (validator.isEmail(email)) {
                    return true
                } else {
                    throw new Error(`${email} is not a valid email`)
                }
            },
            message: (props) => `${props.reason.message}`,
        },
        required: [true, "phone number required"],
        default: 0,
        trim: true,
    },
    otp: {
        type: String,
        required: [true, "otp required"],
        minlength: [6, "otp should contain 6 numbers"],
        maxlength: [6, "otp should contain 6 numbers"],
        trim: true,
    },
    otp_exp_time: {
        type: Date,
        required: [true, "otp expire time required"],
    },
    role: [{
        type: String,
        required: [true, "role required"],
        trim: true,
    }],
    is_active: {
        type: Boolean,
        default: 1,
        trim: true,
    },
    tokens: [
        {
            token: {
                type: String,
                required: true,
            },
            createdAt: {
                type: String,
                required: true,
            },
            timezone: {
                type: String,
                required: true,
            },
        },
    ],
}, { timestamps: true });


// mongoose middleware to invoke, before data saving into db
userSchema.pre("save", async function (next, err) {
    const user = this;
    user.phone_number = cipher.encrypt(user.phone_number);
    user.email = cipher.encrypt(user.email);
    user.otp = cipher.encrypt(user.otp);
    user.role.concat(user.role)
    next();
});

// //Middleware to invoke, after data saved into db 
// userSchema.post("save", async function (userData) {
//     //To check if role is customer or not 
//     if (userData.role.includes("8d21cc7ddc404ca26bdf0e2f2453bbf6")) {
//         let { _id, name, email, phone_number, dob, gender } = userData
//         let patientData = { user_id: userData._id, name: cipher.decrypt(name), email: cipher.decrypt(email), phone_number: cipher.decrypt(phone_number), dob: dob, gender: cipher.decrypt(gender), relation: "self" }
//         try {
//             let patients = new Patient(patientData)
//             var response = await patients.save(patientData)
//         } catch (e) {
//             throw e
//         }
//     }
// });


//decoding the encripted fields in db while sending data to end users
userSchema.post("findOne", function (userData) {
    try {
        userData.phone_number = cipher.decrypt(userData.phone_number);
        userData.email = cipher.decrypt(userData.email);
        let roles = []
        userData.role.forEach((item) => roles.push(cipher.decrypt(item)))
        userData.role = roles;
    } catch (err) {
        Logger.error(`users.model - userSchema.post - lineno-207, Error: ${err}`);
    }
})

//checking unique fields validations
userSchema.post("save", function (error, doc, next) {
    if (error.code === 11000 && Object.keys(error.keyValue)[0] === 'email') {
        next(new Error('Email already exist'));
    } else if (error.code === 11000 && Object.keys(error.keyValue)[0] === 'phone_number') {
        next(new Error('Phone number already exist'));
    } else {
        next();
    }
})

//Middleware to invoke, before data updating into db
userSchema.pre('findOneAndUpdate', async function middleware(next) {
    const user = this;
    let updatedData = this.getUpdate()
    let filterData = this.getFilter()
    this.getUpdate().otp = cipher.encrypt(updatedData.otp)
    next()
})

const Users = mongoose.model("users", userSchema);

module.exports = Users;

//Due to circula dependency we need to require patient file after users exports
const Patient = require("../PatientModels/patient_model")