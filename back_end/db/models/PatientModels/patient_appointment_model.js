const mongoose = require("mongoose");
const Patients = require("./patient_model")
const Schema = mongoose.Schema
const PatientIntakeProcess = require("./patient_intake_process_model")

const patientAppointmentSchema = new mongoose.Schema({
    patient_id: {
        type: Schema.Types.ObjectId, ref: 'patients',
        required: [true, "Patient id required"],
        trim: true,
    },
    doctor_id: {
        type: String,
        required: [true, "Doctor id required"],
        trim: true,
    },
    clinic_id: {
        type: String,
        required: [true, "Clinic id number required"],
        trim: true,
    },
    purpose_of_consultation: {
        type: String,
        required: [true, "name required"],
        minlength: [3, "Purpose of consultation contains at least 3 letters"],
        trim: true,
    },
    appintment_date_time: {
        type: Date,
        required: [true, "Appintment date time required"],
        trim: true,
    },
    is_rescheduled: {
        type: Boolean,
        default: false,
        trim: true,
    },
    doctor_advice: {
        type: String,
        minlength: [6, "name contains at least 6 letters"],
        trim: true,
    },
    appointment_status: {
        type: Number,
        required: [true, "Appointment status required"],
        trim: true,
    },

}, { timestamps: true });

//Middleware to invoke, before data saving into db
patientAppointmentSchema.pre("save", async function (next) {
    const patientAppointment = this;
    var e = {};
    try {
        //To check given patient id is vailable or not in patients table
        let patientsCount = await Patients.count({ _id: patientAppointment.patient_id })
        if (!patientsCount) {
            e.message = "patient id not available in master table"
            throw e
        } else {
            next()
        }
    } catch (err) {
        Logger.error(`patient_model - patientSchema.pre - lineno-71, Error: ${err}`);
        next(err);
    }
});

//Middleware to invoke, before data deleting in db
patientAppointmentSchema.pre("findOneAndRemove", async function (next) {
    var e = {};
    let patientAppointmentId = this.getQuery()._id
    try {
        //To check whether intake process is in serted with given appointment id
        let patientIntakeCount = await PatientIntakeProcess.count({ appointment_id: patientAppointmentId })

        //If intake process is available removing data
        if (patientIntakeCount) {
            await PatientIntakeProcess.findOneAndRemove({ appointment_id: patientAppointmentId })
        }
        next()
    } catch (err) {
        Logger.error(`patient_model - patientSchema.pre - lineno-71, Error: ${err}`);
        next(err);
    }
})

const PatientAppointments = mongoose.model("patient_appointments", patientAppointmentSchema);

module.exports = PatientAppointments;