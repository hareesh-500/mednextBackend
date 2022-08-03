const mongoose = require("mongoose");

const masterProductsSchema = new mongoose.Schema({
    medicine_id: {
        type: String,
        unique: true,
        required: [true, "Medicine id required"],
        trim: true,
    },
    medicine_name: {
        type: String,
        unique: true,
        required: [true, "Medicine name required"],
        trim: true,
    },
    manufacturer: {
        type: String,
        required: [true, "Manufacturer required"],
        trim: true,
    },
    strength: {
        type: String,
        required: [true, "strength required"],
        trim: true,
    },
    size: {
        type: Number,
        required: [true, "Size required"],
        trim: true,
    },
    price_to_stocklist: {
        type: String,
        default: null,
        trim: true,
    },
    mrp: {
        type: Number,
        required: [true, "MRP required"],
        trim: true,
    },
    discount: {
        type: Number,
        default: 0,
        trim: true,
    },
    price_to_retail: {
        type: Number,
        default: 0,
        trim: true,
    },
    goods_service_tax: {
        type: Number,
        default: 0,
        trim: true,
    },
    goods_price_to_retail: {
        type: Number,
        default: 0,
        trim: true,
    },
    composition: {
        type: String,
        required: [true, "Composition required"],
        trim: true,
    },
    form: {
        type: String,
        required: [true, "Form required"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Description required"],
        trim: true,
    },
    attributes: {
        type: String,
        required: [true, "Attributes required"],
        trim: true,
    },
    is_featured: {
        type: String,
        default: null,
        trim: true,
    },
    is_deleted: {
        type: Boolean,
        default: false,
        trim: true,
    },
    hsn_code: {
        type: String,
        default: null,
        trim: true,
    },
    is_validated: {
        type: String,
        default: null,
        trim: true,
    },
    company_id: {
        type: String,
        default: null,
        trim: true,
    },
    product_class_id: {
        type: String,
        default: null,
        trim: true,
    },
    product_type: {
        type: String,
        default: null,
        trim: true,
    },
    product_type: {
        type: String,
        default: null,
        trim: true,
    },
}, { timestamps: true });

const MasterProducts = mongoose.model("master_products", masterProductsSchema);

module.exports = MasterProducts;