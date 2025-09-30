import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { Link } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        speciality: '',
        education: '',
        experience: '',
        hospitalAffiliation: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await api.get('/api/auth', {
                    headers: { 'x-auth-token': token }
                });
                setFormData(res.data);
            } catch (error) {
                console.error('Could not fetch profile', error);
            }
        };
        fetchProfile();
    }, []);

    const { name, email, speciality, education, experience, hospitalAffiliation } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await api.put('/api/profile', formData, {
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token }
            });
            alert('Profile Updated Successfully!');
        } catch (error) {
            console.error('Error updating profile', error);
            alert('Failed to update profile.');
        }
    };

    return (
        <div className="profile-page">
            <header className="profile-header">
                <h1>Edit Your Profile</h1>
                <Link to="/prescription" className="back-btn">← Back to Dashboard</Link>
            </header>
            <main className="profile-content">
                <form className="profile-form" onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="name" value={name} onChange={onChange} />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" value={email} disabled />
                    </div>
                    <div className="form-group">
                        <label>Speciality</label>
                        <input type="text" name="speciality" value={speciality} onChange={onChange} />
                    </div>
                    <div className="form-group">
                        <label>Education</label>
                        <input type="text" name="education" value={education} onChange={onChange} />
                    </div>
                    <div className="form-group">
                        <label>Years of Experience</label>
                        <input type="text" name="experience" value={experience} onChange={onChange} />
                    </div>
                    <div className="form-group">
                        <label>Hospital/Clinic Affiliation</label>
                        <input type="text" name="hospitalAffiliation" value={hospitalAffiliation} onChange={onChange} />
                    </div>
                    <button type="submit" className="update-btn">Update Profile</button>
                </form>
            </main>
        </div>
    );
};

export default ProfilePage;