// backend/routes/medicines.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DoctorStats = require('../models/DoctorStats');
const Medicine = require('../models/Medicine');


// @route   GET /api/medicines
// @desc    Get all medicines grouped by category
router.get('/', auth, async (req, res) => {
    try {
        const medicines = await Medicine.find({});
        const groupedMedicines = medicines.reduce((acc, med) => {
            const { category } = med;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push({ name: med.name, category: med.category });
            return acc;
        }, {});
        res.json(groupedMedicines);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/medicines/favorites
// @desc    Get doctor's most frequently prescribed medicines
router.get('/favorites', auth, async (req, res) => {
    try {
        const stats = await DoctorStats.findOne({ doctor: req.user.id });
        if (!stats) {
            return res.json([]);
        }
        
        const favorites = stats.medicineUsage
            .sort((a, b) => b.count - a.count) 
            .slice(0, 15) // Top 15
            .map(item => item.medicine);
            
        res.json(favorites);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;