const mongoose = require("mongoose");
const Schema = mongoose.Schema
const validator = require("validator");
const bcrypt = require("bcrypt");
const cipher = require("../../../helpers/cipher")

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "name required"],
        minlength: [3, "name contains at least 3 letters"],
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        validate: {
            validator: function (useremail) {
                return validator.isEmail(useremail);
            },
            message: (props) => `${props.value} is not a valide email`,
        },
        required: [true, "email required"],
        trim: true,
    },
    phone_number: {
        type: String,
        unique: true,
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
        default: 0,
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
    password: {
        type: String,
        minlength: [6, "password contains at least 6 letters"],
        maxlength: [16, "password contains max of 16 charectors"],
        required: [true, "password required"],
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
        type: Number,
        required: [true, "otp expire time required"],
        trim: true,
    },
    role: [{
        type: String,
        required: [true, "role required"],
        trim: true,
    }],
    status: {
        type: Boolean,
        required: [true, "status required"],
        trim: true,
    },
    is_active: {
        type: Boolean,
        required: [true, "is active required"],
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

userSchema.virtual("task", {
    ref: "task",
    localField: "_id",
    foreignField: "owner",
});

userSchema.methods.generateAuthToken = async function () {
    const User = this;
    User.tokens = User.tokens.concat({ token });
    await User.save()
};
// userSchema.statics.updateToken = async (id, token) => {
//     console.log("data.....", id, token)
//     const User = this;
//     console.log("data.....", User)
//     User.tokens = User.tokens.concat({ token });
//     await User.save()
//     //return user;
// };

// mongoose middleware to invoke, before data saving into db
userSchema.pre("save", async function (next) {
    const user = this;
    var e = {};
    //To check is password contains numbers,alphabets and special charectors
    if (user.isModified("password")) {
        if (
            !/^(?=.*\d)(?=.*[a-zA-Z])(?=.*[~!@#$%^&*./])[\da-zA-Z~!@#$%^&*./]{6,16}$/.test(
                user.password
            )
        ) {
            e.message =
                "password contains alphabets,numbers,special charectors";
            throw e;
        }

        //Encripting user data before saving into db
        const salt = await bcrypt.genSalt();
        let hashedPassword = await bcrypt.hash(user.password, salt);
        user.password = hashedPassword;
        user.phone_number = cipher.encrypt(user.phone_number);
        user.email = cipher.encrypt(user.email);
        user.name = cipher.encrypt(user.name);
        user.otp = cipher.encrypt(user.otp);
        user.gender = cipher.encrypt(user.gender);
        let roles = []
        user.role.forEach((item) => roles.push(cipher.encrypt(item)))
        user.role = roles
    }
    next();
});

//Middleware to invoke, after data saved into db 
userSchema.post("save", async function (userData) {
    //To check if role is customer or not 
    if (userData.role.includes("8d21cc7ddc404ca26bdf0e2f2453bbf6")) {
        let { _id, name, email, phone_number, dob, gender } = userData
        let patientData = { user_id: userData._id, name: cipher.decrypt(name), email: cipher.decrypt(email), phone_number: cipher.decrypt(phone_number), dob: dob, gender: cipher.decrypt(gender), relation: "self" }
        try {
            let patients = new Patient(patientData)
            var response = await patients.save(patientData)
        } catch (e) {
            throw e
        }
    }
});

userSchema.pre("insertMany", async function (next, userData) {
    var e = {};
    userData.map(function (item) {
        if (
            !/^(?=.*\d)(?=.*[a-zA-Z])(?=.*[~!@#$%^&*./])[\da-zA-Z~!@#$%^&*./]{6,16}$/.test(
                item.password
            )
        ) {
            e.message =
                "password contains alphabets,numbers,special charectors";
            throw e;
        }
    });
    userData = await Promise.all(
        userData.map(async function (user) {
            const salt = await bcrypt.genSalt();
            user.password = await bcrypt.hash(user.password, salt);
            return user;
        })
    );
    next();
});

//decoding the encripted fields in db while sending data to end users
userSchema.post("findOne", function (userData) {
    try {
        userData.phone_number = cipher.decrypt(userData.phone_number);
        userData.email = cipher.decrypt(userData.email);
        userData.name = cipher.decrypt(userData.name);
        userData.otp = cipher.decrypt(userData.otp);
        let roles = []
        userData.role.forEach((item) => roles.push(cipher.decrypt(item)))
        userData.role = roles;
    } catch (err) {
        Logger.error(`users.model - userSchema.post - lineno-207, Error: ${err}`);
    }
})

//encoding the fields from payload while sending data to db
// userSchema.pre("findOne", function (next) {
//     //console.log("login....12", this.plugins)

//     // userData.last_name = cipher.encrypt(userData.last_name)
//     // userData.phone_number = cipher.encrypt(userData.phone_number);
//     // userData.email = cipher.encrypt(userData.email);
//     // userData.name = cipher.encrypt(userData.name);
//     // userData.user_name = cipher.encrypt(userData.user_name);
//     // userData.otp = cipher.encrypt(userData.otp);
//     // userData.role = cipher.encrypt(userData.role);
// })

//checking unique fields validations
userSchema.post("save", function (error, doc, next) {
    if (error.code === 11000 && Object.keys(error.keyValue)[0] === 'user_name') {
        next(new Error('User name already exist'));
    } else if (error.code === 11000 && Object.keys(error.keyValue)[0] === 'email') {
        next(new Error('Email already exist'));
    } else if (error.code === 11000 && Object.keys(error.keyValue)[0] === 'phone_number') {
        next(new Error('Phone number already exist'));
    } else {
        next();
    }
})

const Users = mongoose.model("users", userSchema);

module.exports = Users;

//Due to circula dependency we need to require patient file after users exports
const Patient = require("../PatientModels/patient_model")