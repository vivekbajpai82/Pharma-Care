const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DoctorStatsSchema = new Schema({
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    medicineUsage: [{
        medicine: { type: String, required: true },
        count: { type: Number, default: 1 }
    }]
});

module.exports = mongoose.model('DoctorStats', DoctorStatsSchema);