import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Footer from "../components/Footer.jsx";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
import "./PrescriptionPage.css";
import api from '../config/api';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const PrescriptionComponent = React.forwardRef(
  ({ medicines, patientData, doctorInfo }, ref) => {
    const { t, i18n } = useTranslation();
    const groupedMedicines = medicines.reduce((acc, med) => {
      const { category } = med;
      if (!acc[category]) acc[category] = [];
      acc[category].push(med);
      return acc;
    }, {});

    // Format date as DD/MM/YYYY
    const formatDate = (date) => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    return (
      <div ref={ref} className={`prescription-paper ${i18n.language}`}>
        <header className="prescription-header">
          <div className="logo-section">
            <img src="/logo.jpg" alt="logo" className="p-logo" />
          </div>
          <div className="p-header-right">
            <h3>{doctorInfo?.hospitalAffiliation || "XYZ MEDICAL COLLEGE"}</h3>
            <p>{doctorInfo?.hospitalAddress || "150/4 xyz Nagar, Lucknow"}</p>
            <p>
              Phone: {doctorInfo?.hospitalPhone || "+91-xxxxxxxxxx"} | Email:{" "}
              {doctorInfo?.hospitalEmail || "ABC@gmail.com"}
            </p>
          </div>
        </header>
        
        <h2 className="prescription-title">{t('prescription.title')}</h2>
        <div className="divider"></div>

        <table className="patient-info-table">
          <tbody>
            <tr>
              <td><strong>{t('prescription.patientName')}</strong> {patientData.name || "_________________"}</td>
              <td><strong>{t('prescription.age')}</strong> {patientData.age || "____"}</td>
              <td><strong>{t('prescription.gender')}</strong> {patientData.gender || "________"}</td>
            </tr>
            <tr>
              <td><strong>{t('prescription.weight')}</strong> {patientData.weight ? `${patientData.weight} kg` : "______ kg"}</td>
              <td><strong>{t('prescription.bloodPressure')}</strong> {patientData.bloodPressure || "__________"}</td>
              <td><strong>{t('prescription.date')}</strong> {formatDate(new Date())}</td>
            </tr>
            {patientData.medication && (
              <tr><td colSpan="3"><strong>{t('prescription.medicalCondition')}</strong> {patientData.medication}</td></tr>
            )}
          </tbody>
        </table>

        <div className="medicines-section">
          <h4>{t('prescription.prescribedMedicines')}</h4>
          {Object.keys(groupedMedicines).length > 0 ? (
            Object.keys(groupedMedicines).map((category, categoryIndex) => (
              <div key={category} className="category-group">
                {Object.keys(groupedMedicines).length > 1 && (
                  <div className="category-title">{category}</div>
                )}
                <table className="medicine-table">
                  <thead>
                    <tr>
                      <th style={{ width: "8%" }}>{t('prescription.serialNo')}</th>
                      <th style={{ width: "45%" }}>{t('prescription.medicineName')}</th>
                      <th style={{ width: "47%" }}>{t('prescription.dosageInstructions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedMedicines[category].map((med, index) => (
                      <tr key={index}>
                        <td className="serial-no">{index + 1}</td>
                        <td className="med-name">{med.name}</td>
                        <td className="med-dosage">{med.dosage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          ) : (
            <div className="no-medicines">
              <table className="empty-table">
                <thead>
                  <tr>
                    <th style={{ width: "8%" }}>{t('prescription.serialNo')}</th>
                    <th style={{ width: "45%" }}>{t('prescription.medicineName')}</th>
                    <th style={{ width: "47%" }}>{t('prescription.dosageInstructions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <tr key={num}>
                      <td>{num}</td>
                      <td>_________________________</td>
                      <td>_________________________</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="additional-notes-section">
          <h4>{t('prescription.additionalInstructions')}</h4>
          <div className="notes-content">
            <p>{patientData.additionalInstructions || t('prescription.defaultInstructions')}</p>
          </div>
        </div>

        <div className="prescription-footer">
          <div className="footer-content">
            <div className="next-visit">
              <p><strong>{t('prescription.nextVisit')}</strong> {patientData.nextVisit ? formatDate(patientData.nextVisit) : t('prescription.asAdvised')}</p>
            </div>
            <div className="doctor-signature">
              <div className="signature-line">
                <p><strong>Dr. {doctorInfo?.name || "_________________"}</strong></p>
                <p>{t('prescription.speciality')} {doctorInfo?.speciality || "______________"}</p>
                <p>{t('prescription.regNo')} {doctorInfo?.registrationNo || "______________"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

// EMAIL MODAL COMPONENT with translation
const EmailModal = ({ isOpen, onClose, onSend, loading }) => {
  const { t } = useTranslation();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    if (!recipientEmail.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(recipientEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!recipientName.trim()) {
      newErrors.name = 'Recipient name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSend(recipientEmail, recipientName);
  };

  const handleClose = () => {
    setRecipientEmail('');
    setRecipientName('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content email-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Send Prescription via Email</h3>
          <p>Enter recipient details to send the prescription</p>
          <button className="close-btn" onClick={handleClose} disabled={loading}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="email-form">
          <div className="form-group">
            <label htmlFor="recipientName">Recipient Name *</label>
            <input
              id="recipientName"
              type="text"
              placeholder="Enter recipient's full name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              disabled={loading}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="recipientEmail">Email Address *</label>
            <input
              id="recipientEmail"
              type="email"
              placeholder="Enter email address"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              disabled={loading}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          
          <div className="email-info">
            <p>The prescription will be sent as a PDF attachment along with detailed patient and medicine information.</p>
          </div>
          
          <div className="modal-actions">
            <button 
              type="button" 
              className="modal-btn cancel" 
              onClick={handleClose}
              disabled={loading}
            >
              {t('buttons.cancel')}
            </button>
            <button 
              type="submit" 
              className="modal-btn send"
              disabled={loading || !recipientEmail.trim() || !recipientName.trim()}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Sending...
                </>
              ) : (
                <>
                  Send Email
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PrescriptionPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [doctorData, setDoctorData] = useState(null);
  const [patientDetails, setPatientDetails] = useState({
    name: "", medication: "", age: "", weight: "",
    bloodPressure: "", gender: "Male", additionalInstructions: "", nextVisit: "",
  });
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [doctorImage, setDoctorImage] = useState("/default-doctor.png");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState(null);
  const [dosage, setDosage] = useState("");
  const prescriptionRef = useRef();
  const [allMedicines, setAllMedicines] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categorySearch, setCategorySearch] = useState("");
  
  // New state for frequent medicines
  const [frequentMedicines, setFrequentMedicines] = useState([]);
  const [loadingFrequent, setLoadingFrequent] = useState(true);
  const [showFrequentSection, setShowFrequentSection] = useState(false);

  // EMAIL STATE
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      try {
        const [doctorRes, allMedsRes, frequentRes] = await Promise.all([
        api.get("/api/auth", { headers: { "x-auth-token": token } }),
        api.get("/api/medicines", { headers: { "x-auth-token": token } }),
        api.get("/api/prescriptions/frequent-medicines", { headers: { "x-auth-token": token } }),
      ]);
        
        setDoctorData(doctorRes.data);
        if (doctorRes.data.profileImage) { 
          setDoctorImage(doctorRes.data.profileImage);
        }
        setAllMedicines(allMedsRes.data);
        setFrequentMedicines(frequentRes.data || []);
        setLoadingFrequent(false);
        
        // Show frequent section if there are frequent medicines
        if (frequentRes.data && frequentRes.data.length > 0) {
          setShowFrequentSection(true);
        }
        
      } catch (error) {
        console.error("Failed to fetch initial data", error);
        setLoadingFrequent(false);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };
    fetchInitialData();
  }, [navigate]);

  const handleLogout = () => { localStorage.removeItem("token"); navigate("/login"); };
  
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("doctorPhoto", file);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "Content-Type": "multipart/form-data", "x-auth-token": token }};
      const res = await api.post("/api/upload-photo", formData, {
      headers: { "Content-Type": "multipart/form-data", "x-auth-token": token }
      });
      setDoctorImage(res.data.filePath);
      } catch (error) { console.error("Error uploading image:", error); }
  };

  const handleDirectPdfDownload = () => {
    const input = prescriptionRef.current;
    if (!input) return;
    html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
      pdf.save(`Prescription-${patientDetails.name || "Patient"}-${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.pdf`);
    });
  };

  const generatePDFBuffer = async () => {
    return new Promise((resolve) => {
      const input = prescriptionRef.current;
      if (!input) {
        console.log("Prescription ref not found");
        resolve(null);
        return;
      }

      html2canvas(input, { 
        scale: 1.2, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff"
      }).then((canvas) => {
        try {
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const imgHeight = (canvas.height * pdfWidth) / canvas.width;

          const imgData = canvas.toDataURL("image/jpeg", 0.85);

          pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, imgHeight);

          // clean base64
          const pdfBase64 = pdf.output("datauristring").split(",")[1];

          resolve(pdfBase64);
        } catch (err) {
          console.error("PDF generation error:", err);
          resolve(null);
        }
      }).catch((err) => {
        console.error("Canvas generation error:", err);
        resolve(null);
      });
    });
  };

  // Handle email sending
  const handleSendEmail = async (recipientEmail, recipientName) => {
    if (!patientDetails.name || selectedMedicines.length === 0) {
      alert(t('alerts.fillDetailsAndMedicines'));
      return;
    }

    setEmailLoading(true);
    
    try {
      // Generate PDF
      const pdfBuffer = await generatePDFBuffer();
      
      const token = localStorage.getItem("token");
      

      const emailData = {
        recipientEmail,
        recipientName,
        patientDetails,
        medicines: selectedMedicines,
        pdfBuffer
      };

      const response = await api.post("/api/prescriptions/send-email", emailData, {
      headers: { "x-auth-token": token }
      });
      
      if (response.data.success) {
        alert(`Prescription sent successfully to ${recipientEmail}!`);
        setIsEmailModalOpen(false);
      } else {
        alert(`Failed to send email: ${response.data.message}`);
      }
      
    } catch (error) {
      console.error("Email sending error:", error);
      const errorMessage = error.response?.data?.message || "Failed to send email. Please try again.";
      alert(errorMessage);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleInputChange = (e) => setPatientDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const removeMedicine = (medToRemove) => setSelectedMedicines((prev) => prev.filter((med) => med.name !== medToRemove.name));
  const clearAllMedicines = () => setSelectedMedicines([]);
  
  const handleWhatsAppShare = () => {
    const message = `${t('whatsapp.prescriptionTitle')}\n\n${t('whatsapp.patient')} ${patientDetails.name}\n${t('whatsapp.date')} ${new Date().toLocaleDateString('en-IN')}\n${t('whatsapp.doctor')} Dr. ${doctorData?.name}\n\n${t('whatsapp.medicines')}\n${selectedMedicines.map((med, i) => `${i + 1}. ${med.name} - ${med.dosage}`).join('\n')}\n\n${t('whatsapp.instructions')} ${patientDetails.additionalInstructions || t('whatsapp.takeAsPrescribed')}\n\n${t('whatsapp.nextVisit')} ${patientDetails.nextVisit ? new Date(patientDetails.nextVisit).toLocaleDateString('en-IN') : t('prescription.asAdvised')}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const addMedicine = (medName, medCategory = "General") => {
    if (selectedMedicines.some((med) => med.name === medName)) return;
    setCurrentMedicine({ name: medName, category: medCategory });
    setIsModalOpen(true);
  };

  // Quick add frequent medicine with default category
  const addFrequentMedicine = (medName) => {
    addMedicine(medName, "Frequently Used");
  };

  const handleAddMedicineWithDosage = () => {
    if (dosage.trim() === "") { 
      alert(t('modal.pleaseEnterDosage')); 
      return; 
    }
    setSelectedMedicines([...selectedMedicines, { ...currentMedicine, dosage: dosage }]);
    setDosage("");
    setIsModalOpen(false);
    setCurrentMedicine(null);
  };

  const handleSavePrescription = async () => {
    if (!patientDetails.name || selectedMedicines.length === 0) {
      alert(t('alerts.fillDetailsAndMedicines'));
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "x-auth-token": token } };
      const prescriptionData = { 
        patientDetails: {
          ...patientDetails,
          prescriptionDate: new Date().toISOString()
        }, 
        medicines: selectedMedicines 
      };
      await api.post("/api/prescriptions", prescriptionData, {
      headers: { "x-auth-token": token }
      });
      alert(t('alerts.prescriptionSaved'));
      setPatientDetails({ name: "", medication: "", age: "", weight: "", bloodPressure: "", gender: "Male", additionalInstructions: "", nextVisit: "" });
      setSelectedMedicines([]);
      
      // Refresh frequent medicines after saving
      try {
        const frequentRes = await api.get("/api/prescriptions/frequent-medicines", {
        headers: { "x-auth-token": token }
        });
        setFrequentMedicines(frequentRes.data || []);
        setShowFrequentSection(frequentRes.data && frequentRes.data.length > 0);
      } catch (err) {
        console.error("Failed to refresh frequent medicines", err);
      }
      
    } catch (error) {
      console.error("Failed to save prescription", error);
      alert(t('alerts.failedToSave'));
    }
  };

  const filteredCategories = Object.keys(allMedicines).filter((category) =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  if (!doctorData) {
    return (<div className="loading-container"><div className="loading-spinner"></div><p>{t('loading.loadingDashboard')}</p></div>);
  }

  return (
    <div className="prescription-page">
      <header className="p-main-header">
        <div className="header-left">
          <h2>{t('header.title')}</h2>
          <span className="brand">{t('header.brand')}</span>
        </div>
        <div className="header-right">
          <LanguageSwitcher />
          <Link to="/history" className="history-link">{t('header.viewHistory')}</Link>
          <Link to="/profile" className="welcome-text">{t('header.welcome', { name: doctorData.name })}</Link>
          <button className="logout-btn" onClick={handleLogout}>{t('header.logout')}</button>
        </div>
      </header>
      <main className="p-main-content">
        <div className="left-column">
          <div className="patient-form">
            <div className="form-header">
              <h3>{t('patientForm.title')}</h3>
              <span className="form-subtitle">{t('patientForm.subtitle')}</span>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>{t('patientForm.patientName')} *</label>
                <input 
                  name="name" 
                  value={patientDetails.name} 
                  onChange={handleInputChange} 
                  placeholder={t('patientForm.patientNamePlaceholder')}
                />
              </div>
              <div className="form-group">
                <label>{t('patientForm.medicalCondition')}</label>
                <input 
                  name="medication" 
                  value={patientDetails.medication} 
                  onChange={handleInputChange} 
                  placeholder={t('patientForm.medicalConditionPlaceholder')}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('patientForm.age')}</label>
                <input 
                  name="age" 
                  type="number" 
                  value={patientDetails.age} 
                  onChange={handleInputChange} 
                  placeholder={t('patientForm.agePlaceholder')}
                />
              </div>
              <div className="form-group">
                <label>{t('patientForm.weight')}</label>
                <input 
                  name="weight" 
                  type="number" 
                  value={patientDetails.weight} 
                  onChange={handleInputChange} 
                  placeholder={t('patientForm.weightPlaceholder')}
                />
              </div>
              <div className="form-group">
                <label>{t('patientForm.gender')}</label>
                <select name="gender" value={patientDetails.gender} onChange={handleInputChange}>
                  <option value="">{t('patientForm.selectGender')}</option>
                  <option value="Male">{t('patientForm.male')}</option>
                  <option value="Female">{t('patientForm.female')}</option>
                  <option value="Other">{t('patientForm.other')}</option>
                </select>
              </div>
            </div>
            <div className="form-group full-width">
              <label>{t('patientForm.bloodPressure')}</label>
              <input 
                name="bloodPressure" 
                value={patientDetails.bloodPressure} 
                onChange={handleInputChange} 
                placeholder={t('patientForm.bloodPressurePlaceholder')}
              />
            </div>
            <div className="form-group full-width">
              <label>{t('patientForm.additionalInstructions')}</label>
              <textarea 
                name="additionalInstructions" 
                value={patientDetails.additionalInstructions} 
                onChange={handleInputChange} 
                placeholder={t('patientForm.additionalInstructionsPlaceholder')}
                rows="3"
              />
            </div>
            <div className="form-group full-width">
              <label>{t('patientForm.nextVisitDate')}</label>
              <input 
                name="nextVisit" 
                type="date" 
                value={patientDetails.nextVisit} 
                onChange={handleInputChange} 
              />
            </div>
            <button className="generate-btn" onClick={handleSavePrescription}>
              {t('patientForm.savePrescription')}
            </button>
          </div>
          <div className="medicine-selector">
            <div className="selector-header"><h3>{t('medicineSelector.title')}</h3></div>
            
            {/* Frequent Medicines Section */}
            {showFrequentSection && (
              <div className="frequent-medicines-section">
                <div className="frequent-header">
                  <h4>Frequently Prescribed ({frequentMedicines.length})</h4>
                  <button 
                    className="toggle-frequent-btn"
                    onClick={() => setShowFrequentSection(!showFrequentSection)}
                  >
                    {showFrequentSection ? '−' : '+'}
                  </button>
                </div>
                {showFrequentSection && (
                  <div className="frequent-medicines-grid">
                    {loadingFrequent ? (
                      <p className="loading-text">Loading frequent medicines...</p>
                    ) : frequentMedicines.length > 0 ? (
                      frequentMedicines.map((med, index) => (
                        <button
                          key={index}
                          className={`frequent-med-btn ${selectedMedicines.some(m => m.name === med.name) ? 'selected' : ''}`}
                          onClick={() => addFrequentMedicine(med.name)}
                          disabled={selectedMedicines.some(m => m.name === med.name)}
                        >
                          <span className="med-name">{med.name}</span>
                          <span className="usage-count">Used {med.count}x</span>
                          {selectedMedicines.some(m => m.name === med.name) && (
                            <span className="selected-check">✓</span>
                          )}
                        </button>
                      ))
                    ) : (
                      <p className="no-frequent-text">No frequently used medicines yet. Create some prescriptions first!</p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="med-selection-area">
              {selectedCategory ? (
                <div className="drill-down-list">
                  <button className="back-to-cat-btn" onClick={() => setSelectedCategory(null)}>
                    {t('medicineSelector.backToCategories')}
                  </button>
                  {(allMedicines[selectedCategory] || []).map((med, i) => (
                    <div key={i} className={`med-item ${selectedMedicines.some((m) => m.name === med.name) ? "selected" : ""}`} onClick={() => addMedicine(med.name, med.category)}>
                      <span className="med-name">{med.name}</span>
                      {selectedMedicines.some((m) => m.name === med.name) && (<span className="selected-indicator">✓</span>)}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="category-search-container">
                    <input 
                      type="text" 
                      placeholder={t('medicineSelector.searchPlaceholder')} 
                      className="category-search" 
                      value={categorySearch} 
                      onChange={(e) => setCategorySearch(e.target.value)} 
                    />
                  </div>
                  <div className="med-category-tabs">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => (
                        <button key={category} className="category-btn" onClick={() => setSelectedCategory(category)}>
                          {category}
                        </button>
                      ))
                    ) : (
                      <p className="no-results-text">{t('medicineSelector.noCategoryFound', { search: categorySearch })}</p>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="selected-medicines-box">
              <div className="selected-header">
                <h4>{t('medicineSelector.selectedMedicines', { count: selectedMedicines.length })}</h4>
                {selectedMedicines.length > 0 && (
                  <button className="clear-btn" onClick={clearAllMedicines}>
                    {t('medicineSelector.clearAll')}
                  </button>
                )}
              </div>
              <div className="selected-list">
                {selectedMedicines.length > 0 ? (
                  selectedMedicines.map((med, i) => (
                    <div key={i} className="selected-item">
                      <div className="selected-item-info">
                        <span className="med-name-preview">{med.name}</span>
                        <span className="med-dosage-preview">{med.dosage}</span>
                        <span className="med-category-preview">{med.category}</span>
                      </div>
                      <button className="remove-med-btn" onClick={() => removeMedicine(med)}>×</button>
                    </div>
                  ))
                ) : (
                  <p className="no-meds-text">{t('medicineSelector.noMedicinesSelected')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="right-column">
          <div className="doctor-details-card">
            <div className="card-header"><h4>{t('doctorProfile.title')}</h4></div>
            <div className="doctor-profile">
              <div className="doctor-photo-container">
                <img src={doctorImage} alt="Doctor" className="doctor-photo"/>
                <label htmlFor="photo-upload" className="upload-btn">{t('doctorProfile.changePhoto')}</label>
                <input id="photo-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }}/>
              </div>
              <div className="doctor-info">
                <p className="doctor-name">Dr. {doctorData.name}</p>
                <p className="doctor-specialty">{doctorData.speciality}</p>
              </div>
            </div>
          </div>
          <div className="prescription-preview">
            <PrescriptionComponent ref={prescriptionRef} medicines={selectedMedicines} patientData={patientDetails} doctorInfo={doctorData}/>
            <div className="button-group">
              <button onClick={handleDirectPdfDownload} className="print-btn">
                {t('buttons.saveAsPDF')}
              </button>
              <button onClick={handleWhatsAppShare} className="whatsapp-btn">
                {t('buttons.shareViaWhatsApp')}
              </button>
              <button 
                onClick={() => setIsEmailModalOpen(true)} 
                className="email-btn"
                disabled={!patientDetails.name || selectedMedicines.length === 0}
              >
                Send via Email
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Medicine Dosage Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{t('modal.addMedicineDosage')}</h3>
              <p>{t('modal.enterDosageFor', { name: currentMedicine?.name })}</p>
            </div>
            <input 
              type="text" 
              className="dosage-input" 
              placeholder={t('modal.dosagePlaceholder')} 
              value={dosage} 
              onChange={(e) => setDosage(e.target.value)} 
              autoFocus
            />
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setIsModalOpen(false)}>
                {t('buttons.cancel')}
              </button>
              <button className="modal-btn add" onClick={handleAddMedicineWithDosage}>
                {t('buttons.addMedicine')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL MODAL */}
      <EmailModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)}
        onSend={handleSendEmail}
        loading={emailLoading}
      />
    </div>
  );
};

export default PrescriptionPage;