// backend/models/Prescription.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MedicineSchema = new Schema({
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    category: { type: String, required: true }
}, { _id: false });

const PrescriptionSchema = new Schema({
    doctor: {
        type: Schema.Types.ObjectId,
        ref: 'User', // User model se link karein
        required: true
    },
    patientDetails: {
        name: { type: String, required: true },
        age: { type: String },
        gender: { type: String },
        weight: { type: String },
        bloodPressure: { type: String },
        medication: { type: String }, 
        additionalInstructions: { type: String },
        nextVisit: { type: Date }
    },
    medicines: [MedicineSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);