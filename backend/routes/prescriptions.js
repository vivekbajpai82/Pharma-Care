const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Prescription = require('../models/Prescription');
const User = require('../models/User');
const DoctorStats = require('../models/DoctorStats');
const { sendPrescriptionEmail } = require('../utils/emailService'); // NEW IMPORT

// @route   POST /api/prescriptions
// @desc    Save a new prescription and update doctor stats
router.post('/', auth, async (req, res) => {
    try {
        const { patientDetails, medicines } = req.body;

        // Create new prescription
        const newPrescription = new Prescription({
            doctor: req.user.id,
            patientDetails,
            medicines
        });
        const prescription = await newPrescription.save();

        // Update Doctor Stats for frequent medicines
        let stats = await DoctorStats.findOne({ doctor: req.user.id });
        if (!stats) {
            stats = new DoctorStats({ 
                doctor: req.user.id, 
                medicineUsage: [] 
            });
        }

        // Update medicine usage count
        medicines.forEach(med => {
            const medIndex = stats.medicineUsage.findIndex(m => m.medicine.toLowerCase() === med.name.toLowerCase());
            if (medIndex > -1) {
                stats.medicineUsage[medIndex].count++;
            } else {
                stats.medicineUsage.push({ 
                    medicine: med.name, 
                    count: 1 
                });
            }
        });

        // Sort by count and keep top 50 medicines only
        stats.medicineUsage.sort((a, b) => b.count - a.count);
        if (stats.medicineUsage.length > 50) {
            stats.medicineUsage = stats.medicineUsage.slice(0, 50);
        }

        await stats.save();

        res.json(prescription);
    } catch (err) {
        console.error('Prescription save error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/prescriptions
// @desc    Get all prescriptions for a logged-in doctor
router.get('/', auth, async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ doctor: req.user.id })
            .populate('doctor', 'name speciality')
            .sort({ createdAt: -1 });
        res.json(prescriptions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/prescriptions/frequent-medicines
// @desc    Get doctor's frequently prescribed medicines
router.get('/frequent-medicines', auth, async (req, res) => {
    try {
        const stats = await DoctorStats.findOne({ doctor: req.user.id });
        
        if (!stats || stats.medicineUsage.length === 0) {
            return res.json([]);
        }

        // Return top 15 frequently used medicines
        const frequentMedicines = stats.medicineUsage
            .sort((a, b) => b.count - a.count)
            .slice(0, 15)
            .map(med => ({
                name: med.medicine,
                count: med.count
            }));

        res.json(frequentMedicines);
    } catch (err) {
        console.error('Frequent medicines error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/prescriptions/stats
// @desc    Get doctor's prescription statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const totalPrescriptions = await Prescription.countDocuments({ doctor: req.user.id });
        
        const stats = await DoctorStats.findOne({ doctor: req.user.id });
        const uniqueMedicines = stats ? stats.medicineUsage.length : 0;
        const totalMedicinesPrescribed = stats ? 
            stats.medicineUsage.reduce((total, med) => total + med.count, 0) : 0;

        res.json({
            totalPrescriptions,
            uniqueMedicines,
            totalMedicinesPrescribed,
            averageMedicinesPerPrescription: totalPrescriptions > 0 ? 
                Math.round((totalMedicinesPrescribed / totalPrescriptions) * 100) / 100 : 0
        });
    } catch (err) {
        console.error('Stats error:', err.message);
        res.status(500).send('Server Error');
    }
});

// NEW ROUTE: Send prescription via email
// @route   POST /api/prescriptions/send-email
// @desc    Send prescription via email with PDF attachment
router.post('/send-email', auth, async (req, res) => {
    try {
        const { 
            recipientEmail, 
            recipientName, 
            patientDetails, 
            medicines, 
            pdfBuffer 
        } = req.body;

        // Validate required fields
        if (!recipientEmail || !patientDetails || !medicines || medicines.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: recipientEmail, patientDetails, and medicines' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipientEmail)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email format' 
            });
        }

        // Get doctor info
        const doctorInfo = await User.findById(req.user.id).select('name speciality hospitalAffiliation');
        if (!doctorInfo) {
            return res.status(404).json({ 
                success: false, 
                message: 'Doctor not found' 
            });
        }

        // Prepare prescription data
        const prescriptionData = {
            patientDetails,
            medicines,
            createdAt: new Date()
        };

        // Convert base64 PDF to buffer if provided
        let pdfBufferConverted = null;
        if (pdfBuffer) {
            try {
                // If pdfBuffer is base64 string, convert to buffer
                if (typeof pdfBuffer === 'string') {
                    // Remove data:application/pdf;base64, prefix if present
                    const base64Data = pdfBuffer.replace(/^data:application\/pdf;base64,/, '');
                    pdfBufferConverted = Buffer.from(base64Data, 'base64');
                } else {
                    pdfBufferConverted = pdfBuffer;
                }
            } catch (pdfError) {
                console.error('PDF conversion error:', pdfError);
                // Continue without PDF attachment
            }
        }

        // Send email
        const emailResult = await sendPrescriptionEmail(
            recipientEmail,
            recipientName,
            prescriptionData,
            doctorInfo,
            pdfBufferConverted
        );

        if (emailResult.success) {
            res.json({
                success: true,
                message: `Prescription sent successfully to ${recipientEmail}`,
                messageId: emailResult.messageId
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send email',
                error: emailResult.error
            });
        }

    } catch (error) {
        console.error('Send email error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error occurred while sending email',
            error: error.message
        });
    }
});

module.exports = router;