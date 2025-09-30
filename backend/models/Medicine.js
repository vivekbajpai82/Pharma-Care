const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MedicineSchema = new Schema({
    name: { type: String, required: true, unique: true },
    // Category ab beemari ya type ho sakti hai
    category: { type: String, required: true, index: true } 
});

module.exports = mongoose.model('Medicine', MedicineSchema);