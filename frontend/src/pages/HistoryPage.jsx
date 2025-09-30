// frontend/src/pages/HistoryPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { Link } from 'react-router-dom';
import './HistoryPage.css'; // Iske liye CSS bhi banayenge

const HistoryPage = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await api.get('/api/prescriptions', {
                headers: { 'x-auth-token': token }
                });
                setPrescriptions(res.data);
            } catch (error) {
                console.error("Could not fetch prescription history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div>Loading history...</div>;

    return (
        <div className="history-page">
            <header className="history-header">
                <h1>Prescription History</h1>
                <Link to="/prescription" className="back-btn">← Back to Dashboard</Link>
            </header>
            <main className="history-content">
                {prescriptions.length > 0 ? (
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Patient Name</th>
                                <th>Age</th>
                                <th>Condition</th>
                                <th>Medicines</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prescriptions.map(p => (
                                <tr key={p._id}>
                                    <td>{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                                    <td>{p.patientDetails.name}</td>
                                    <td>{p.patientDetails.age}</td>
                                    <td>{p.patientDetails.medication}</td>
                                    <td>{p.medicines.map(m => m.name).join(', ')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-history">No prescriptions found. Go to the dashboard to create one.</p>
                )}
            </main>
        </div>
    );
};

export default HistoryPage;