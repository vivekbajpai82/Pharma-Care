const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MedicineSchema = new Schema({
    name: { type: String, required: true, unique: true },
    category: { type: String, required: true, index: true } 
});

module.exports = mongoose.model('Medicine', MedicineSchema);