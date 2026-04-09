require('dotenv').config();
const brevo = require('@getbrevo/brevo');

// Brevo API client setup helper
const getBrevoClient = () => {
    const apiInstance = new brevo.TransactionalEmailsApi();
    // V3 syntax: ['api-key'] ki jagah seedha .apiKey use hota hai
    apiInstance.authentications.apiKey.apiKey = process.env.BREVO_API_KEY;
    return apiInstance;
};

// Process PDF Buffer
const processPDFBuffer = (pdfBuffer) => {
    if (!pdfBuffer) return null;
    try {
        if (typeof pdfBuffer === 'string') {
            if (pdfBuffer.startsWith('data:application/pdf;base64,')) {
                return pdfBuffer.split(',')[1];
            }
            if (pdfBuffer.startsWith('data:application/pdf;filename=generated.pdf;base64,')) {
                return pdfBuffer.split('base64,')[1];
            }
            if (!pdfBuffer.includes('data:')) return pdfBuffer;
            const base64Match = pdfBuffer.match(/base64,(.+)/);
            if (base64Match) return base64Match[1];
        }
        if (Buffer.isBuffer(pdfBuffer)) {
            return pdfBuffer.toString('base64');
        }
        return null;
    } catch (error) {
        console.error('Error processing PDF buffer:', error);
        return null;
    }
};

// Send password reset email
const sendResetPasswordEmail = async (userEmail, resetToken, userName) => {
    try {
        const apiInstance = getBrevoClient();
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.subject = 'Password Reset - Pharma Care';
        sendSmtpEmail.to = [{ email: userEmail, name: userName }];
        sendSmtpEmail.sender = { name: 'Pharma Care Support', email: process.env.EMAIL_USER };
        sendSmtpEmail.htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">🏥 Pharma Care</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Healthcare Partner</p>
                </div>
                <div style="background: white; padding: 40px; border-radius: 10px; margin-top: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <h2 style="color: #333;">Hello ${userName}!</h2>
                    <p style="color: #666; line-height: 1.6;">We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                            Reset Your Password
                        </a>
                    </div>
                    <p style="color: #666;">This link will expire in <strong>10 minutes</strong>.</p>
                    <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>
                </div>
                <div style="text-align: center; margin-top: 20px; color: #999; font-size: 14px;">
                    <p>© 2025 Pharma Care. All rights reserved.</p>
                </div>
            </div>
        `;

        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Reset email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Reset email failed:', error);
        return { success: false, error: error.message };
    }
};

// Send prescription email
const sendPrescriptionEmail = async (recipientEmail, recipientName, prescriptionData, doctorInfo, pdfBuffer) => {
    try {
        const apiInstance = getBrevoClient();
        const { patientDetails, medicines, createdAt } = prescriptionData;
        const prescriptionDate = new Date(createdAt).toLocaleDateString('en-IN');

        const medicinesList = medicines.map((med, index) =>
            `<tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px; text-align: center;">${index + 1}</td>
                <td style="padding: 8px; font-weight: 500;">${med.name}</td>
                <td style="padding: 8px; color: #666;">${med.dosage}</td>
                <td style="padding: 8px; font-size: 12px; color: #888;">${med.category}</td>
            </tr>`
        ).join('');

        const processedPDFBuffer = processPDFBuffer(pdfBuffer);

        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.subject = `Medical Prescription for ${patientDetails.name} - Pharma Care`;
        sendSmtpEmail.to = [{ email: recipientEmail, name: recipientName || 'Patient' }];
        sendSmtpEmail.sender = { name: `Pharma Care - Dr. ${doctorInfo.name}`, email: process.env.EMAIL_USER };
        sendSmtpEmail.htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center;">
                    <h1 style="margin: 0;">🏥 Pharma Care</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Digital Medical Prescription</p>
                </div>
                <div style="background: white; padding: 40px; border-radius: 10px; margin-top: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <p style="color: #666;">Dear ${recipientName || 'Sir/Madam'},</p>
                    <p style="color: #666;">Prescription by <strong>Dr. ${doctorInfo.name}</strong> (${doctorInfo.speciality}) on <strong>${prescriptionDate}</strong>.</p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin: 0 0 15px 0;">Patient Information</h3>
                        <table style="width: 100%;">
                            <tr><td style="color: #666; width: 30%;"><strong>Name:</strong></td><td>${patientDetails.name}</td><td><strong>Age:</strong></td><td>${patientDetails.age || 'N/A'}</td></tr>
                            <tr><td style="color: #666;"><strong>Gender:</strong></td><td>${patientDetails.gender || 'N/A'}</td><td><strong>Weight:</strong></td><td>${patientDetails.weight ? `${patientDetails.weight} kg` : 'N/A'}</td></tr>
                        </table>
                    </div>

                    <h3 style="color: #333;">Prescribed Medicines (${medicines.length})</h3>
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                                <th style="padding: 12px; width: 8%;">S.No</th>
                                <th style="padding: 12px; text-align: left;">Medicine Name</th>
                                <th style="padding: 12px; text-align: left;">Dosage</th>
                                <th style="padding: 12px; text-align: left;">Category</th>
                            </tr>
                        </thead>
                        <tbody>${medicinesList}</tbody>
                    </table>

                    <div style="border-top: 2px solid #eee; padding-top: 20px; margin-top: 30px; text-align: right;">
                        <p style="margin: 0; font-weight: 500;">Dr. ${doctorInfo.name}</p>
                        <p style="margin: 5px 0 0 0; color: #666;">${doctorInfo.speciality}</p>
                    </div>

                    ${processedPDFBuffer ? `
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center;">
                        <p style="margin: 0; color: #666;">📎 PDF prescription attached for your records.</p>
                    </div>` : ''}
                </div>
                <div style="text-align: center; margin-top: 20px; color: #999; font-size: 14px;">
                    <p>© 2025 Pharma Care. All rights reserved.</p>
                </div>
            </div>
        `;

        if (processedPDFBuffer) {
            sendSmtpEmail.attachment = [{
                name: `Prescription_${patientDetails.name}_${prescriptionDate.replace(/\//g, '-')}.pdf`,
                content: processedPDFBuffer
            }];
        }

        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Prescription email sent:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Prescription email failed:', error);
        return { success: false, error: error.message };
    }
};

// Send welcome email
const sendWelcomeEmail = async (userEmail, userName) => {
    try {
        const apiInstance = getBrevoClient();

        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.subject = 'Welcome to Pharma Care!';
        sendSmtpEmail.to = [{ email: userEmail, name: userName }];
        sendSmtpEmail.sender = { name: 'Pharma Care Team', email: process.env.EMAIL_USER };
        sendSmtpEmail.htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; border-radius: 15px; color: white; text-align: center;">
                    <h1 style="margin: 0; font-size: 32px;">🏥 Pharma Care</h1>
                    <p style="margin: 15px 0 0 0; font-size: 18px;">Digital Healthcare Platform</p>
                </div>
                <div style="background: white; padding: 40px; border-radius: 15px; margin-top: 25px; box-shadow: 0 8px 30px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; text-align: center;">Welcome, Dr. ${userName}! 🎉</h2>
                    <p style="color: #666; line-height: 1.8;">Congratulations on joining Pharma Care! Your journey towards modern prescription management starts now.</p>
                    
                    <div style="background: #e8f5e8; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 5px solid #4CAF50;">
                        <h3 style="color: #2E7D32; margin: 0 0 15px 0;">🚀 What You Can Do:</h3>
                        <ul style="color: #2E7D32; line-height: 1.8; margin: 0; padding-left: 20px;">
                            <li>Create Digital Prescriptions instantly</li>
                            <li>Manage Patient Records</li>
                            <li>Share Prescriptions via Email or WhatsApp</li>
                            <li>Access comprehensive Medicine Database</li>
                        </ul>
                    </div>

                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 18px 35px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; display: inline-block;">
                            Start Creating Prescriptions →
                        </a>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 20px; color: #999; font-size: 14px;">
                    <p>© 2025 Pharma Care. All rights reserved.</p>
                </div>
            </div>
        `;

        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Welcome email sent:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Welcome email failed:', error);
        return { success: false, error: error.message };
    }
};

// Test connection
const testEmailConnection = async () => {
    try {
        const accountApi = new brevo.AccountApi();
        // Setup API key correctly for AccountApi 
        accountApi.authentications.apiKey.apiKey = process.env.BREVO_API_KEY;
        await accountApi.getAccount();
        console.log('✅ Brevo email service is ready');
        return true;
    } catch (error) {
        console.error('❌ Brevo email service error:', error);
        return false;
    }
};

module.exports = {
    sendResetPasswordEmail,
    sendPrescriptionEmail,
    sendWelcomeEmail,
    testEmailConnection
};