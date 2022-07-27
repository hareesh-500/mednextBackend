const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const cipher = require("../../../helpers/cipher")

const userSchema = new mongoose.Schema({
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
    password: {
        type: String,
        minlength: [6, "password contains at least 6 letters"],
        maxlength: [16, "password contains max of 16 charectors"],
        required: [true, "password required"],
        // validate: {
        //     validator: function (password) {
        //         if (password == "0") return true;
        //         return validator.isAlphanumeric(password);
        //     },
        //     message: (props) => `${props.value} password contains alphabets,numbers,special charectors`,
        // },
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
    role: {
        type: String,
        required: [true, "role required"],
        trim: true,
    },
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

// mongoose middleware
userSchema.pre("save", async function (next) {
    const user = this;
    var e = {};
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

        const salt = await bcrypt.genSalt();
        let hashedPassword = await bcrypt.hash(user.password, salt);
        user.password = hashedPassword;
        user.phone_number = cipher.encrypt(user.phone_number);
        user.email = cipher.encrypt(user.email);
        user.name = cipher.encrypt(user.name);
        user.otp = cipher.encrypt(user.otp);
        user.role = cipher.encrypt(user.role);
    }
    next();
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
        userData.role = cipher.decrypt(userData.role);
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
    console.log("error.code..", error.code, error)
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

// function getter(value) {
//     return cipher.decrypt(value)
// }
const Users = mongoose.model("users", userSchema);
// userSchema.set("toObject", { getters: true });
// userSchema.set("toJSON", { getters: true });


module.exports = Users;