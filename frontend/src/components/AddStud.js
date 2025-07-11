import React, { useState } from 'react';
import axios from 'axios';
import './AddStud.css';

export default function AddStud() {
  const [formData, setFormData] = useState({
    name: '',
    regNo: '',
    email: '',
    dob: '',
    image: '',
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [fileName, setFileName] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setSuccess('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const newErrors = { ...errors };
    setFileName(file.name);

    if (!validTypes.includes(file.type)) {
      newErrors.image = 'Only JPG, JPEG, PNG files are allowed.';
      setErrors(newErrors);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      newErrors.image = 'File size must be less than 2MB.';
      setErrors(newErrors);
      return;
    }

    newErrors.image = '';
    setErrors(newErrors);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, regNo, email, dob, image } = formData;

    const newErrors = {};
    if (!regNo) newErrors.regNo = 'Register number is required.';
    if (!name) newErrors.name = 'Name is required.';
    if (!email) newErrors.email = 'Email is required.';
    if (!dob) newErrors.dob = 'Date of Birth is required.';
    if (!image) newErrors.image = 'Image is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await axios.post('https://teq-wish.onrender.com/api/students', formData);
      if (res.status === 200) {
        setSuccess('Student added successfully!');
        alert('Student added successfully!');
        setFormData({ name: '', regNo: '', email: '', dob: '', image: '' });
        setErrors({});
        setFileName('');
        document.getElementById('studentImage').value = '';
      } else {
        setSuccess('');
        setErrors({ general: 'Failed to add student.' });
         alert('Failed to add student...');
      }
    } catch (err) {
      setSuccess('');
      setErrors({ general: 'Server error. Please try again.' });
    }
  };

  return (
    <div className="add-student-container">
      <h1 className="form-title">Add Student</h1>
      {errors.general && <p className="error-msg">{errors.general}</p>}
      {success && <p className="success-msg">{success}</p>}

      <form className="student-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group half">
            <label>Register No</label>
            <input
              name="regNo"
              type="text"
              value={formData.regNo}
              onChange={handleChange}
              placeholder="Enter register number"
            />
            {errors.regNo && <span className="error-msg">{errors.regNo}</span>}
          </div>

          <div className="form-group half">
            <label>Name</label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter student name"
            />
            {errors.name && <span className="error-msg">{errors.name}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
          />
          {errors.email && <span className="error-msg">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>DOB</label>
          <input
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleChange}
          />
          {errors.dob && <span className="error-msg">{errors.dob}</span>}
        </div>

        <div className="form-group">
          <label>Upload Student Image</label>
          <label htmlFor="studentImage" className="custom-file">Choose File</label>
          <input
            type="file"
            id="studentImage"
            accept=".jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
          {fileName && <p className="file-name">Selected file: {fileName}</p>}
          {errors.image && <span className="error-msg">{errors.image}</span>}
        </div>

        <div className="form-buttons">
          <button type="submit" className="submit-btn">Add</button>
          <button
            type="reset"
            className="clear-btn"
            onClick={() => {
              setFormData({ name: '', regNo: '', email: '', dob: '', image: '' });
              setErrors({});
              setFileName('');
              document.getElementById('studentImage').value = '';
            }}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
