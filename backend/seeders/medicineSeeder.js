const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Medicine = require('../models/Medicine');

const medicines = [
    // General Medicine & Fever
    { name: 'Paracetamol', category: 'General & Fever' },
    { name: 'Ibuprofen', category: 'General & Fever' },
    { name: 'Aspirin', category: 'General & Fever' },
    { name: 'Nimesulide', category: 'General & Fever' },
    { name: 'Domperidone', category: 'General & Fever' },
    { name: 'Diclofenac', category: 'General & Fever' },
    { name: 'Aceclofenac', category: 'General & Fever' },
    { name: 'Mefenamic Acid', category: 'General & Fever' },

    // Cold, Cough & Allergy
    { name: 'Cetirizine', category: 'Cold & Allergy' },
    { name: 'Levocetirizine', category: 'Cold & Allergy' },
    { name: 'Fexofenadine', category: 'Cold & Allergy' },
    { name: 'Dextromethorphan Syrup', category: 'Cold & Allergy' },
    { name: 'Ambroxol Syrup', category: 'Cold & Allergy' },
    { name: 'Guaifenesin Syrup', category: 'Cold & Allergy' },
    { name: 'Montelukast', category: 'Cold & Allergy' },
    { name: 'Loratadine', category: 'Cold & Allergy' },
    { name: 'Phenylephrine', category: 'Cold & Allergy' },
    { name: 'Bromhexine', category: 'Cold & Allergy' },
    { name: 'Terbutaline Syrup', category: 'Cold & Allergy' },

    // Antibiotics
    { name: 'Amoxicillin', category: 'Antibiotics' },
    { name: 'Azithromycin', category: 'Antibiotics' },
    { name: 'Ciprofloxacin', category: 'Antibiotics' },
    { name: 'Doxycycline', category: 'Antibiotics' },
    { name: 'Metronidazole', category: 'Antibiotics' },
    { name: 'Cefixime', category: 'Antibiotics' },
    { name: 'Ofloxacin', category: 'Antibiotics' },
    { name: 'Clarithromycin', category: 'Antibiotics' },
    { name: 'Cephalexin', category: 'Antibiotics' },
    { name: 'Levofloxacin', category: 'Antibiotics' },
    { name: 'Erythromycin', category: 'Antibiotics' },
    { name: 'Clindamycin', category: 'Antibiotics' },

    // Gastro / Stomach
    { name: 'Omeprazole', category: 'Gastro' },
    { name: 'Pantoprazole', category: 'Gastro' },
    { name: 'Ranitidine', category: 'Gastro' },
    { name: 'Loperamide', category: 'Gastro' },
    { name: 'Ondansetron', category: 'Gastro' },
    { name: 'Lactulose Solution', category: 'Gastro' },
    { name: 'Esomeprazole', category: 'Gastro' },
    { name: 'Famotidine', category: 'Gastro' },
    { name: 'Simethicone', category: 'Gastro' },
    { name: 'Sucralfate', category: 'Gastro' },
    { name: 'Rabeprazole', category: 'Gastro' },

    // Cardio (Heart)
    { name: 'Atorvastatin', category: 'Cardio' },
    { name: 'Rosuvastatin', category: 'Cardio' },
    { name: 'Lisinopril', category: 'Cardio' },
    { name: 'Ramipril', category: 'Cardio' },
    { name: 'Metoprolol', category: 'Cardio' },
    { name: 'Clopidogrel', category: 'Cardio' },
    { name: 'Amlodipine', category: 'Cardio' },
    { name: 'Enalapril', category: 'Cardio' },
    { name: 'Losartan', category: 'Cardio' },
    { name: 'Carvedilol', category: 'Cardio' },
    { name: 'Furosemide', category: 'Cardio' },
    { name: 'Spironolactone', category: 'Cardio' },

    // Neuro (Brain & Nerves)
    { name: 'Alprazolam', category: 'Neuro' },
    { name: 'Clonazepam', category: 'Neuro' },
    { name: 'Sertraline', category: 'Neuro' },
    { name: 'Escitalopram', category: 'Neuro' },
    { name: 'Gabapentin', category: 'Neuro' },
    { name: 'Pregabalin', category: 'Neuro' },
    { name: 'Fluoxetine', category: 'Neuro' },
    { name: 'Amitriptyline', category: 'Neuro' },
    { name: 'Phenytoin', category: 'Neuro' },
    { name: 'Carbamazepine', category: 'Neuro' },

    // Dermatology (Skin)
    { name: 'Clotrimazole Cream', category: 'Dermatology' },
    { name: 'Mupirocin Ointment', category: 'Dermatology' },
    { name: 'Hydrocortisone Cream', category: 'Dermatology' },
    { name: 'Betamethasone Cream', category: 'Dermatology' },
    { name: 'Terbinafine Cream', category: 'Dermatology' },
    { name: 'Ketoconazole Cream', category: 'Dermatology' },
    { name: 'Calamine Lotion', category: 'Dermatology' },
    { name: 'Tretinoin Cream', category: 'Dermatology' },
    { name: 'Salicylic Acid', category: 'Dermatology' },

    // Vitamins & Supplements
    { name: 'Vitamin C (Ascorbic Acid)', category: 'Vitamins' },
    { name: 'Vitamin D3 (Cholecalciferol)', category: 'Vitamins' },
    { name: 'B-Complex Forte', category: 'Vitamins' },
    { name: 'Iron (Ferrous Sulfate) Syrup', category: 'Vitamins' },
    { name: 'Calcium Carbonate', category: 'Vitamins' },
    { name: 'Folic Acid', category: 'Vitamins' },
    { name: 'Multivitamin Tablets', category: 'Vitamins' },
    { name: 'Omega-3 Capsules', category: 'Vitamins' },
    { name: 'Magnesium Supplement', category: 'Vitamins' },
    { name: 'Zinc Tablets', category: 'Vitamins' },

    // ENT (Ear, Nose, Throat)
    { name: 'Xylometazoline Nasal Drops', category: 'ENT' },
    { name: 'Saline Nasal Spray', category: 'ENT' },
    { name: 'Ciprofloxacin Ear Drops', category: 'ENT' },
    { name: 'Ofloxacin Ear Drops', category: 'ENT' },
    { name: 'Benzocaine Lozenges', category: 'ENT' },
    { name: 'Chlorhexidine Mouthwash', category: 'ENT' },
    { name: 'Betamethasone Nasal Drops', category: 'ENT' },
    { name: 'Hydrogen Peroxide Ear Drops', category: 'ENT' },
    { name: 'Fluticasone Nasal Spray', category: 'ENT' },
    { name: 'Povidone Iodine Gargle', category: 'ENT' },

    // Orthopedic (Bones & Joints)
    { name: 'Calcium & Vitamin D3 Tablets', category: 'Orthopedic' },
    { name: 'Glucosamine', category: 'Orthopedic' },
    { name: 'Diclofenac Gel', category: 'Orthopedic' },
    { name: 'Methyl Salicylate Ointment', category: 'Orthopedic' },
    { name: 'Chondroitin Sulfate', category: 'Orthopedic' },
    { name: 'Capsaicin Cream', category: 'Orthopedic' },

    // Diabetes
    { name: 'Metformin', category: 'Diabetes' },
    { name: 'Glibenclamide', category: 'Diabetes' },
    { name: 'Insulin (Human)', category: 'Diabetes' },
    { name: 'Gliclazide', category: 'Diabetes' },
    { name: 'Pioglitazone', category: 'Diabetes' },
    { name: 'Sitagliptin', category: 'Diabetes' },
    { name: 'Glimepiride', category: 'Diabetes' },
    { name: 'Vildagliptin', category: 'Diabetes' },
    { name: 'Empagliflozin', category: 'Diabetes' },
    { name: 'Canagliflozin', category: 'Diabetes' },
    { name: 'Insulin Glargine', category: 'Diabetes' },
    { name: 'Insulin Aspart', category: 'Diabetes' },

    // Respiratory
    { name: 'Salbutamol Inhaler', category: 'Respiratory' },
    { name: 'Budesonide Inhaler', category: 'Respiratory' },
    { name: 'Theophylline', category: 'Respiratory' },
    { name: 'Prednisolone', category: 'Respiratory' },
    { name: 'Ipratropium Bromide', category: 'Respiratory' },
    { name: 'Formoterol', category: 'Respiratory' },
    { name: 'Fluticasone Inhaler', category: 'Respiratory' },
    { name: 'Salmeterol', category: 'Respiratory' },
    { name: 'Tiotropium', category: 'Respiratory' },
    { name: 'N-Acetylcysteine', category: 'Respiratory' },
    { name: 'Montelukast (Asthma)', category: 'Respiratory' },

    // Gynecology
    { name: 'Mefenamic Acid (Menstrual)', category: 'Gynecology' },
    { name: 'Norethisterone', category: 'Gynecology' },
    { name: 'Clomiphene Citrate', category: 'Gynecology' },
    { name: 'Progesterone Capsules', category: 'Gynecology' },
    { name: 'Ethinyl Estradiol', category: 'Gynecology' },
    { name: 'Fluconazole (Vaginal)', category: 'Gynecology' },
    { name: 'Metronidazole (Vaginal)', category: 'Gynecology' },
    { name: 'Clotrimazole Pessary', category: 'Gynecology' },
    { name: 'Drospirenone', category: 'Gynecology' },
    { name: 'Letrozole', category: 'Gynecology' },
    { name: 'Gonadotropin', category: 'Gynecology' },

    // Urology
    { name: 'Tamsulosin', category: 'Urology' },
    { name: 'Finasteride', category: 'Urology' },
    { name: 'Nitrofurantoin', category: 'Urology' },
    { name: 'Oxybutynin', category: 'Urology' },
    { name: 'Solifenacin', category: 'Urology' },
    { name: 'Doxazosin', category: 'Urology' },
    { name: 'Dutasteride', category: 'Urology' },
    { name: 'Mirabegron', category: 'Urology' },
    { name: 'Tolterodine', category: 'Urology' },
    { name: 'Alfuzosin', category: 'Urology' },

    // Ophthalmology (Eye)
    { name: 'Timolol Eye Drops', category: 'Ophthalmology' },
    { name: 'Chloramphenicol Eye Drops', category: 'Ophthalmology' },
    { name: 'Prednisolone Eye Drops', category: 'Ophthalmology' },
    { name: 'Cyclopentolate Eye Drops', category: 'Ophthalmology' },
    { name: 'Artificial Tears', category: 'Ophthalmology' },
    { name: 'Tobramycin Eye Drops', category: 'Ophthalmology' },

    // Hepatology (Liver)
    { name: 'Ursodeoxycholic Acid', category: 'Hepatology' },
    { name: 'Silymarin', category: 'Hepatology' },
    { name: 'L-Ornithine L-Aspartate', category: 'Hepatology' },
    { name: 'Lactulose (Hepatic)', category: 'Hepatology' },

    // Emergency & Critical Care
    { name: 'Atropine Injection', category: 'Emergency' },
    { name: 'Epinephrine Injection', category: 'Emergency' },
    { name: 'Dextrose 25%', category: 'Emergency' },
    { name: 'Naloxone', category: 'Emergency' },
    { name: 'Activated Charcoal', category: 'Emergency' },

    // Pediatrics
    { name: 'Oral Rehydration Solution', category: 'Pediatrics' },
    { name: 'Paracetamol Syrup (Pediatric)', category: 'Pediatrics' },
    { name: 'Zinc Syrup', category: 'Pediatrics' },
    { name: 'Gripe Water', category: 'Pediatrics' },
    { name: 'Iron Drops (Pediatric)', category: 'Pediatrics' },
    { name: 'Vitamin D Drops', category: 'Pediatrics' },

    // Anti-parasitic
    { name: 'Albendazole', category: 'Anti-parasitic' },
    { name: 'Mebendazole', category: 'Anti-parasitic' },
    { name: 'Ivermectin', category: 'Anti-parasitic' },
    { name: 'Praziquantel', category: 'Anti-parasitic' },

    // Hormonal
    { name: 'Levothyroxine', category: 'Hormonal' },
    { name: 'Carbimazole', category: 'Hormonal' },
    { name: 'Dexamethasone', category: 'Hormonal' },
    { name: 'Hydrocortisone Tablets', category: 'Hormonal' },
    { name: 'Testosterone Gel', category: 'Hormonal' },

    // Oncology (Cancer)
    { name: 'Methotrexate', category: 'Oncology' },
    { name: 'Tamoxifen', category: 'Oncology' },
    { name: 'Cyclophosphamide', category: 'Oncology' },
    { name: 'Cisplatin', category: 'Oncology' },
    { name: 'Paclitaxel', category: 'Oncology' },

    // Hematology (Blood)
    { name: 'Warfarin', category: 'Hematology' },
    { name: 'Heparin', category: 'Hematology' },
    { name: 'Erythropoietin', category: 'Hematology' },
    { name: 'Folic Acid (Anemia)', category: 'Hematology' },
    { name: 'Vitamin B12 Injection', category: 'Hematology' },
    { name: 'Iron Sucrose', category: 'Hematology' },

    // Rheumatology (Joints & Autoimmune)
    { name: 'Methotrexate (Arthritis)', category: 'Rheumatology' },
    { name: 'Hydroxychloroquine', category: 'Rheumatology' },
    { name: 'Sulfasalazine', category: 'Rheumatology' },
    { name: 'Prednisolone (Arthritis)', category: 'Rheumatology' },
    { name: 'Leflunomide', category: 'Rheumatology' },

    // Infectious Diseases
    { name: 'Acyclovir', category: 'Infectious Diseases' },
    { name: 'Oseltamivir', category: 'Infectious Diseases' },
    { name: 'Amphotericin B', category: 'Infectious Diseases' },
    { name: 'Fluconazole (Systemic)', category: 'Infectious Diseases' },
    { name: 'Rifampicin', category: 'Infectious Diseases' },
    { name: 'Isoniazid', category: 'Infectious Diseases' },

    // Anesthesia & Pain Management
    { name: 'Lidocaine Injection', category: 'Anesthesia' },
    { name: 'Tramadol', category: 'Anesthesia' },
    { name: 'Morphine', category: 'Anesthesia' },
    { name: 'Bupivacaine', category: 'Anesthesia' },
    { name: 'Fentanyl', category: 'Anesthesia' },

    // Dermatology Advanced
    { name: 'Minoxidil Solution', category: 'Dermatology' },
    { name: 'Isotretinoin', category: 'Dermatology' },
    { name: 'Tacrolimus Ointment', category: 'Dermatology' },
    { name: 'Clobetasol Cream', category: 'Dermatology' },

    // Nephrology (Kidney)
    { name: 'ACE Inhibitors (Kidney)', category: 'Nephrology' },
    { name: 'Calcium Acetate', category: 'Nephrology' },
    { name: 'Erythropoietin (Kidney)', category: 'Nephrology' },
    { name: 'Sevelamer', category: 'Nephrology' },
    { name: 'Allopurinol', category: 'Nephrology' },

    // Psychiatry
    { name: 'Haloperidol', category: 'Psychiatry' },
    { name: 'Risperidone', category: 'Psychiatry' },
    { name: 'Lithium Carbonate', category: 'Psychiatry' },
    { name: 'Quetiapine', category: 'Psychiatry' },
    { name: 'Olanzapine', category: 'Psychiatry' },
    { name: 'Aripiprazole', category: 'Psychiatry' },

    // Geriatrics (Elderly Care)
    { name: 'Donepezil', category: 'Geriatrics' },
    { name: 'Memantine', category: 'Geriatrics' },
    { name: 'Rivastigmine', category: 'Geriatrics' },
    { name: 'Calcium + D3 (Elderly)', category: 'Geriatrics' },

    // Immunology & Vaccines
    { name: 'Hepatitis B Vaccine', category: 'Immunology' },
    { name: 'Influenza Vaccine', category: 'Immunology' },
    { name: 'Immunoglobulin', category: 'Immunology' },
    { name: 'Cyclosporine', category: 'Immunology' },
    { name: 'Azathioprine', category: 'Immunology' },

    // Sexual Health
    { name: 'Sildenafil', category: 'Sexual Health' },
    { name: 'Tadalafil', category: 'Sexual Health' },
    { name: 'Dapoxetine', category: 'Sexual Health' },

    // Addiction & Rehabilitation
    { name: 'Disulfiram', category: 'Addiction' },
    { name: 'Naltrexone', category: 'Addiction' },
    { name: 'Buprenorphine', category: 'Addiction' },
    { name: 'Nicotine Patches', category: 'Addiction' },

    // Sports Medicine
    { name: 'Ibuprofen Gel', category: 'Sports Medicine' },
    { name: 'Muscle Relaxant Gel', category: 'Sports Medicine' },
    { name: 'Protein Supplements', category: 'Sports Medicine' },
    { name: 'Creatine', category: 'Sports Medicine' },

    // Travel Medicine
    { name: 'Doxycycline (Malaria)', category: 'Travel Medicine' },
    { name: 'Mefloquine', category: 'Travel Medicine' },
    { name: 'Oral Cholera Vaccine', category: 'Travel Medicine' },
    { name: 'Typhoid Vaccine', category: 'Travel Medicine' },

    // Homeopathy & Alternative
    { name: 'Arnica Montana', category: 'Homeopathy' },
    { name: 'Belladonna', category: 'Homeopathy' },
    { name: 'Nux Vomica', category: 'Homeopathy' },
    { name: 'Rhus Tox', category: 'Homeopathy' },

    // Ayurvedic
    { name: 'Chyawanprash', category: 'Ayurvedic' },
    { name: 'Ashwagandha', category: 'Ayurvedic' },
    { name: 'Triphala', category: 'Ayurvedic' },
    { name: 'Brahmi', category: 'Ayurvedic' },
    { name: 'Giloy', category: 'Ayurvedic' }
];

const seedMedicines = async () => {
    await connectDB();
    try {
        await Medicine.deleteMany();
        console.log('Old medicines cleared...');
        await Medicine.insertMany(medicines);
        console.log('New expanded list of medicines imported!');
        process.exit();
    } catch (error) {
        console.error('Error with seeder:', error);
        process.exit(1);
    }
};

seedMedicines();