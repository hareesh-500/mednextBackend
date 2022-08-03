const mongoose = require("mongoose");
const Schema = mongoose.Schema
require('mongoose-double')(mongoose);
const SchemaTypes = mongoose.Schema.Types;

const appointmentTransactionSchema = new Schema({
    appointment_id: {
        type: Schema.Types.ObjectId, ref: 'patient_appointments',
        required: [true, "Appointment id required"],
        trim: true,
    },
    doctor_discount_amount: {
        type: SchemaTypes.Double,
        default: null,
        trim: true,
    },
    doctor_discount_type: {
        type: String,
        default: null,
        trim: true,
    },
    coupon_id: {
        type: String,
        default: null,
        trim: true,
    },
    coupon_discount_type: {
        type: String,
        default: null,
        trim: true,
    },
    coupon_discount_amount: {
        type: SchemaTypes.Double,
        default: null,
        trim: true,
    },
    doctor_fee: {
        type: SchemaTypes.Double,
        required: [true, "doctor fee required"],
        trim: true,
    },
    payble_amount: {
        type: SchemaTypes.Double,
        required: [true, "Payble amount required"],
        trim: true,
    },
    transaction_id: {
        type: String,
        required: [true, "Transaction id required"],
        trim: true,
    },
    is_refund_initiated: {
        type: Boolean,
        default: false,
        trim: true,
    },
    refund_id: {
        type: String,
        default: null,
        trim: true,
    },
    refund_amount: {
        type: SchemaTypes.Double,
        default: null,
        trim: true,
    },
    refund_status: {
        type: String,
        default: null,
        trim: true,
    }
}, { timestamps: true });

const AppointmentTransactions = mongoose.model("appointment_transactions", appointmentTransactionSchema);

module.exports = AppointmentTransactions;