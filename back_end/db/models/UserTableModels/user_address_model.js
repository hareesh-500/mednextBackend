const mongoose = require("mongoose");
const validator = require("validator");
const Schema = mongoose.Schema
const Users = require("./master_user_model")
const MasterStates = require("../MasterTableModels/master_states_model")
const MasterCountries = require("../MasterTableModels/master_countries")
const MasterCities = require("../MasterTableModels/master_cities")

const userAddressSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId, ref: 'users',
        required: [true, "User id required"],
        trim: true,
    },
    user_name: {
        type: String,
        trim: true,
    },
    phone_number: {
        type: String,
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
    complete_address: {
        type: String,
        required: [true, "Complete address id required"],
        trim: true,
    },
    land_mark: {
        type: String,
        trim: true,
    },
    state: {
        type: Schema.Types.ObjectId, ref: 'master_states',
        required: [true, "State id required"],
        trim: true,
    },
    city: {
        type: Schema.Types.ObjectId, ref: 'master_cities',
        required: [true, "City id required"],
        trim: true,
    },
    country: {
        type: Schema.Types.ObjectId, ref: 'master_countries',
        required: [true, "Country id required"],
        trim: true,
    },
    pincode: {
        type: String,
        required: [true, "Pincode required"],
        trim: true,
    }
}, { timestamps: true });

//To validate data while saving and updating user address
const validateData = async (userAddress) => {
    var e = {};

    //To check given user id is vailable or not in master table
    let isUserAvailable = await Users.count({ _id: userAddress.user_id })

    //To check given state id is vailable or not in master table
    let isStateAvailable = await MasterStates.count({ _id: userAddress.state })

    //To check given country id is vailable or not in master table
    let isCountryAvailable = await MasterCountries.count({ _id: userAddress.country })

    //To check given city id is vailable or not in master table
    let isCityAvailable = await MasterCities.count({ _id: userAddress.city })

    if (!isUserAvailable) {
        e.message = "User id not available in master table"
        throw e
    } else if (!isStateAvailable) {
        e.message = "State id not available in master table"
        throw e
    } else if (!isCountryAvailable) {
        e.message = "Country id not available in master table"
        throw e
    } else if (!isCityAvailable) {
        e.message = "City id not available in master table"
        throw e
    }
}

//Middleware to invoke, before data saving into db
userAddressSchema.pre("save", async function (next) {
    const userAddress = this;
    try {
        await validateData(userAddress)
        next()
    } catch (err) {
        Logger.error(`user_address_model - userAddressSchema.pre - lineno-79, Error: ${err}`);
        next(err);
    }
});

//Middleware to invoke, before data updating into db
userAddressSchema.pre('findOneAndUpdate', async function middleware(next) {
    const userAddress = this;
    try {
        await validateData(userAddress._update)
        next()

    } catch (err) {
        Logger.error(`user_address_model - userAddressSchema.pre - lineno-115, Error: ${err}`);
        next(err);
    }
})

const UserAddress = mongoose.model("user_address", userAddressSchema);

module.exports = UserAddress;