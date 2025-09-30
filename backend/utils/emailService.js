const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Updated processPDFBuffer function for emailService.js

const processPDFBuffer = (pdfBuffer) => {
    if (!pdfBuffer) {
        console.log('No PDF buffer provided');
        return null;
    }
    
    try {
        if (typeof pdfBuffer === 'string') {
            // Handle data URI format
            if (pdfBuffer.startsWith('data:application/pdf;base64,')) {
                const base64Data = pdfBuffer.split(',')[1];
                console.log('Extracted base64 PDF data, length:', base64Data.length);
                return base64Data;
            }
            
            // Handle datauri format from jsPDF
            if (pdfBuffer.startsWith('data:application/pdf;filename=generated.pdf;base64,')) {
                const base64Data = pdfBuffer.split('base64,')[1];
                console.log('Extracted datauri PDF data, length:', base64Data.length);
                return base64Data;
            }
            
            // Already clean base64
            if (!pdfBuffer.includes('data:')) {
                console.log('Clean base64 PDF data, length:', pdfBuffer.length);
                return pdfBuffer;
            }
            
            console.log('Unknown PDF format, attempting to extract base64...');
            // Try to extract base64 from any data URL
            const base64Match = pdfBuffer.match(/base64,(.+)/);
            if (base64Match) {
                return base64Match[1];
            }
        }
        
        if (Buffer.isBuffer(pdfBuffer)) {
            console.log('Converting buffer to base64');
            return pdfBuffer.toString('base64');
        }
        
        console.log('Invalid PDF buffer type:', typeof pdfBuffer);
        return null;
        
    } catch (error) {
        console.error('Error processing PDF buffer:', error);
        return null;
    }
};

// Send password reset email
const sendResetPasswordEmail = async (userEmail, resetToken, userName) => {
    try {
        const transporter = createTransporter();
        
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
        
        const mailOptions = {
            from: `"Pharma Care Support" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Password Reset Request - Pharma Care',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px;">🏥 Pharma Care</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Healthcare Partner</p>
                    </div>
                    
                    <div style="background: white; padding: 40px; border-radius: 10px; margin-top: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin: 0 0 20px 0;">Hello ${userName}!</h2>
                        
                        <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
                            We received a request to reset your password for your Pharma Care account. 
                            If you didn't make this request, you can safely ignore this email.
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; transition: transform 0.2s;">
                                Reset Your Password
                            </a>
                        </div>
                        
                        <p style="color: #666; line-height: 1.6; margin: 20px 0;">
                            This link will expire in <strong>10 minutes</strong> for your security.
                        </p>
                        
                        <p style="color: #666; line-height: 1.6; margin: 20px 0;">
                            If the button doesn't work, copy and paste this link into your browser:
                        </p>
                        
                        <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all; color: #666; font-size: 14px;">
                            ${resetUrl}
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 14px;">
                        <p>This is an automated message from Pharma Care.</p>
                        <p>If you have any questions, please contact our support team.</p>
                        <p style="margin-top: 15px;">
                            © 2025 Pharma Care. All rights reserved.
                        </p>
                    </div>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
        
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error: error.message };
    }
};

// Send prescription email
const sendPrescriptionEmail = async (recipientEmail, recipientName, prescriptionData, doctorInfo, pdfBuffer) => {
    try {
        const transporter = createTransporter();
        
        const { patientDetails, medicines, createdAt } = prescriptionData;
        const prescriptionDate = new Date(createdAt).toLocaleDateString('en-IN');
        
        // Create medicines list for email
        const medicinesList = medicines.map((med, index) => 
            `<tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px; text-align: center;">${index + 1}</td>
                <td style="padding: 8px; font-weight: 500;">${med.name}</td>
                <td style="padding: 8px; color: #666;">${med.dosage}</td>
                <td style="padding: 8px; font-size: 12px; color: #888;">${med.category}</td>
            </tr>`
        ).join('');

        // Process PDF buffer safely
        const processedPDFBuffer = processPDFBuffer(pdfBuffer);

        const mailOptions = {
            from: `"Pharma Care - Dr. ${doctorInfo.name}" <${process.env.EMAIL_USER}>`,
            to: recipientEmail,
            subject: `Medical Prescription for ${patientDetails.name} - Pharma Care`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px;">🏥 Pharma Care</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Digital Medical Prescription</p>
                    </div>
                    
                    <!-- Main Content -->
                    <div style="background: white; padding: 40px; border-radius: 10px; margin-top: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin: 0 0 20px 0; text-align: center;">Medical Prescription</h2>
                        
                        <p style="color: #666; line-height: 1.6; margin: 0 0 30px 0;">
                            Dear ${recipientName || 'Sir/Madam'},
                        </p>
                        
                        <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
                            Please find your medical prescription </strong> as prescribed by 
                            <strong>Dr. ${doctorInfo.name}</strong> (${doctorInfo.speciality}) on <strong>${prescriptionDate}</strong>.
                        </p>

                        <!-- Patient Information -->
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">Patient Information</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 5px 0; width: 30%; color: #666;"><strong>Patient Name:</strong></td>
                                    <td style="padding: 5px 0; color: #333;">${patientDetails.name}</td>
                                    <td style="padding: 5px 0; width: 20%; color: #666;"><strong>Age:</strong></td>
                                    <td style="padding: 5px 0; color: #333;">${patientDetails.age || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 5px 0; color: #666;"><strong>Gender:</strong></td>
                                    <td style="padding: 5px 0; color: #333;">${patientDetails.gender || 'N/A'}</td>
                                    <td style="padding: 5px 0; color: #666;"><strong>Weight:</strong></td>
                                    <td style="padding: 5px 0; color: #333;">${patientDetails.weight ? `${patientDetails.weight} kg` : 'N/A'}</td>
                                </tr>
                                ${patientDetails.bloodPressure ? `
                                <tr>
                                    <td style="padding: 5px 0; color: #666;"><strong>Blood Pressure:</strong></td>
                                    <td style="padding: 5px 0; color: #333;" colspan="3">${patientDetails.bloodPressure}</td>
                                </tr>` : ''}
                                ${patientDetails.medication ? `
                                <tr>
                                    <td style="padding: 5px 0; color: #666;"><strong>Medical Condition:</strong></td>
                                    <td style="padding: 5px 0; color: #333;" colspan="3">${patientDetails.medication}</td>
                                </tr>` : ''}
                            </table>
                        </div>

                        <!-- Prescribed Medicines -->
                        <div style="margin: 30px 0;">
                            <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">Prescribed Medicines (${medicines.length})</h3>
                            <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                                <thead>
                                    <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                                        <th style="padding: 12px; text-align: center; width: 8%;">S.No</th>
                                        <th style="padding: 12px; text-align: left; width: 35%;">Medicine Name</th>
                                        <th style="padding: 12px; text-align: left; width: 42%;">Dosage Instructions</th>
                                        <th style="padding: 12px; text-align: left; width: 15%;">Category</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${medicinesList}
                                </tbody>
                            </table>
                        </div>

                        ${patientDetails.additionalInstructions ? `
                        <!-- Additional Instructions -->
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 14px;">Additional Instructions:</h4>
                            <p style="color: #856404; margin: 0; line-height: 1.4;">${patientDetails.additionalInstructions}</p>
                        </div>` : ''}

                        ${patientDetails.nextVisit ? `
                        <!-- Next Visit -->
                        <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="color: #0c5460; margin: 0; font-weight: 500;">
                                <strong>Next Visit:</strong> ${new Date(patientDetails.nextVisit).toLocaleDateString('en-IN')}
                            </p>
                        </div>` : ''}

                        <!-- Doctor Information -->
                        <div style="border-top: 2px solid #eee; padding-top: 20px; margin-top: 30px; text-align: right;">
                            <p style="margin: 0; color: #333; font-weight: 500;">Dr. ${doctorInfo.name}</p>
                            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">${doctorInfo.speciality}</p>
                            ${doctorInfo.hospitalAffiliation ? `<p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">${doctorInfo.hospitalAffiliation}</p>` : ''}
                        </div>

                        ${processedPDFBuffer ? `
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 30px; text-align: center;">
                            <p style="margin: 0; color: #666; font-size: 14px;">
                                📎 <strong>PDF prescription is attached</strong> for your records and pharmacy reference.
                            </p>
                        </div>` : `
                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 30px; text-align: center;">
                            <p style="margin: 0; color: #856404; font-size: 14px;">
                                💡 <strong>Note:</strong> PDF attachment could not be generated. All prescription details are included above.
                            </p>
                        </div>`}
                    </div>
                    
                    <!-- Footer -->
                    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 14px;">
                        <p style="margin: 0 0 10px 0;">This is an automated message from Pharma Care digital prescription system.</p>
                        <p style="margin: 0 0 10px 0;">Please consult your doctor if you have any questions about this prescription.</p>
                        <p style="margin: 0; font-weight: 500;">
                            © 2025 Pharma Care. All rights reserved.
                        </p>
                    </div>
                </div>
            `,
            attachments: processedPDFBuffer ? [{
                filename: `Prescription_${patientDetails.name}_${prescriptionDate.replace(/\//g, '-')}.pdf`,
                content: processedPDFBuffer,
                contentType: 'application/pdf',
                encoding: 'base64'
            }] : []
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Prescription email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
        
    } catch (error) {
        console.error('Prescription email sending failed:', error);
        return { success: false, error: error.message };
    }
};





// Send welcome email to new doctors
const sendWelcomeEmail = async (userEmail, userName) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: `"Pharma Care Team" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Welcome to Pharma Care - Your Digital Healthcare Partner!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; border-radius: 15px; color: white; text-align: center; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);">
                        <h1 style="margin: 0; font-size: 32px; font-weight: bold;">🏥 Pharma Care</h1>
                        <p style="margin: 15px 0 0 0; opacity: 0.9; font-size: 18px;">Digital Healthcare Platform</p>
                    </div>
                    
                    <!-- Main Content -->
                    <div style="background: white; padding: 40px; border-radius: 15px; margin-top: 25px; box-shadow: 0 8px 30px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px; text-align: center;">
                            Welcome to Pharma Care, Dr. ${userName}! 🎉
                        </h2>
                        
                        <p style="color: #666; line-height: 1.8; margin: 0 0 25px 0; font-size: 16px;">
                            Congratulations on successfully joining Pharma Care! We're thrilled to have you as part of our 
                            digital healthcare community. Your journey towards modern, efficient prescription management starts now.
                        </p>
                        
                        <div style="background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 5px solid #4CAF50;">
                            <h3 style="color: #2E7D32; margin: 0 0 15px 0; font-size: 18px;">🚀 What You Can Do Now:</h3>
                            <ul style="color: #2E7D32; line-height: 1.8; margin: 0; padding-left: 20px;">
                                <li><strong>Create Digital Prescriptions:</strong> Generate professional, secure prescriptions instantly</li>
                                <li><strong>Manage Patient Records:</strong> Keep track of your prescriptions and patient history</li>
                                <li><strong>Share Prescriptions:</strong> Send prescriptions via email or WhatsApp directly</li>
                                <li><strong>Multi-language Support:</strong> Switch between English and Hindi seamlessly</li>
                                <li><strong>Medicine Database:</strong> Access comprehensive medicine categories and dosages</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 18px 35px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; display: inline-block; transition: transform 0.3s; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);">
                                Start Creating Prescriptions →
                            </a>
                        </div>
                        
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 10px; margin: 25px 0;">
                            <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">💡 Getting Started Tips:</h4>
                            <ul style="color: #856404; line-height: 1.6; margin: 0; padding-left: 20px; font-size: 14px;">
                                <li>Upload your profile photo for a personalized experience</li>
                                <li>Update your speciality and hospital affiliation in your profile</li>
                                <li>Explore the medicine database to familiarize yourself with categories</li>
                                <li>Try creating your first prescription to see how easy it is!</li>
                            </ul>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0; text-align: center;">
                            <h4 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">📞 Need Help?</h4>
                            <p style="color: #666; margin: 0 0 15px 0; line-height: 1.6;">
                                Our support team is here to help you get started. If you have any questions or need assistance, 
                                don't hesitate to reach out.
                            </p>
                            <div style="color: #667eea; font-weight: 500;">
                                <p style="margin: 5px 0;">📧 Email: support@pharmacare.com</p>
                                <p style="margin: 5px 0;">📱 WhatsApp: +91-9335373004</p>
                                <p style="margin: 5px 0;">🕒 Available: 24/7</p>
                            </div>
                        </div>
                        
                        <div style="border-top: 2px solid #eee; padding-top: 25px; margin-top: 30px; text-align: center;">
                            <p style="color: #666; margin: 0 0 15px 0; font-size: 15px;">
                                Thank you for choosing Pharma Care for your digital healthcare needs.
                            </p>
                            <p style="color: #667eea; margin: 0; font-weight: 600; font-size: 16px;">
                                Welcome aboard, Dr. ${userName}! 🩺
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="text-align: center; margin-top: 25px; color: #999; font-size: 14px;">
                        <p style="margin: 0 0 10px 0;">This is an automated welcome message from Pharma Care.</p>
                        <p style="margin: 0 0 10px 0;">You're receiving this because you recently created an account with us.</p>
                        
                        <div style="margin: 20px 0 15px 0; padding: 15px; background: rgba(102, 126, 234, 0.1); border-radius: 8px;">
                            <p style="margin: 0; color: #667eea; font-weight: 500;">
                                🔐 Your account is secure and ready to use!
                            </p>
                        </div>
                        
                        <p style="margin: 15px 0 0 0; font-weight: 500; color: #667eea;">
                            © 2025 Pharma Care. Revolutionizing Healthcare Management.
                        </p>
                    </div>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully to:', userEmail, 'Message ID:', result.messageId);
        return { success: true, messageId: result.messageId };
        
    } catch (error) {
        console.error('Welcome email sending failed:', error);
        return { success: false, error: error.message };
    }
};

// Test email connection
const testEmailConnection = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ Email service is ready');
        return true;
    } catch (error) {
        console.error('❌ Email service error:', error);
        return false;
    }
};

module.exports = {
    sendResetPasswordEmail,
    sendPrescriptionEmail,
    sendWelcomeEmail,
    testEmailConnection
};