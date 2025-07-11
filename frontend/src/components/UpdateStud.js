import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UpdateStud.css';
import { FaTrash} from 'react-icons/fa';
import { useLocation } from 'react-router-dom'; // ✅ NEW

export default function UpdateStud() {
  const location = useLocation(); // ✅ NEW

  const [formData, setFormData] = useState({
    regNo: '',
    name: '',
    email: '',
    dob: '',
    image: '',
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [fileName, setFileName] = useState('');

  // ✅ Auto-fill from navigation (if state exists)
  useEffect(() => {
    if (location.state) {
      const student = location.state;
      setFormData({
        regNo: student.regNo || '',
        name: student.name || '',
        email: student.email || '',
        dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
        image: student.image || '',
      });
      setFileName('');
      setErrors({});
      setSuccess('Student data loaded');
    }
  }, [location.state]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const resetForm = () => {
    setFormData({ regNo: '', name: '', email: '', dob: '', image: '' });
    setFileName('');
    setErrors({});
    setSuccess('');
    const fileInput = document.getElementById('studentImage');
    if (fileInput) fileInput.value = '';
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({});
    setSuccess('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrors({ image: 'Only JPG, JPEG, PNG allowed' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors({ image: 'Max file size is 2MB' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
    setFileName(file.name);
  };

  const handleRetrieve = async () => {
    if (!formData.regNo.trim()) {
      setErrors({ general: 'Register No is required' });
      return;
    }
    try {
      const res = await axios.get(`https://teq-wish.onrender.com/api/students/${formData.regNo}`);
      if (res.status === 200) {
        const data = res.data;
        const formattedDOB = data.dob ? new Date(data.dob).toISOString().split('T')[0] : '';
        setFormData({
          ...data,
          dob: formattedDOB,
        });
        setSuccess('Student data retrieved');
        setErrors({});
        setFileName('');
      } else {
        setSuccess('');
        setErrors({ general: 'Student not found' });
      }
    } catch (err) {
      setErrors({ general: 'Error retrieving student' });
    }
  };

  const handleUpdate = async () => {
    if (!formData.regNo.trim()) {
      setErrors({ general: 'Register No is required' });
      return;
    }
    try {
      const res = await axios.put(`https://teq-wish.onrender.com/api/students/${formData.regNo}`, formData);
      if (res.status === 200) {
        setSuccess('Student updated successfully!');
        alert("Student updated successfully!");
        resetForm();
      } else {
        setErrors({ general: 'Update failed' });
      }
    } catch (err) {
      setErrors({ general: 'Server error on update' });
    }
  };

  const handleDelete = async () => {
    if (!formData.regNo.trim()) {
      setErrors({ general: 'Register No is required' });
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this student?');
    if (!confirmDelete) return;

    try {
      const res = await axios.delete(`https://teq-wish.onrender.com/api/students/${formData.regNo}`);
      if (res.status === 200) {
        setSuccess('Student deleted successfully!');
        alert('Student deleted successfully!');
        resetForm();
      } else {
        setErrors({ general: 'Delete failed' });
      }
    } catch (err) {
      setErrors({ general: 'Server error on delete' });
    }
  };

  return (
    <div className="update-student-container">
      {errors.general && <p className="error-msg">{errors.general}</p>}
      {success && <p className="success-msg">{success}</p>}

      <div className="form-row">
        <div className="form-group">
          <label>Register No</label>
          <input
            name="regNo"
            value={formData.regNo}
            onChange={handleChange}
            placeholder="Enter Register No"
            onKeyDown={(e) => e.key === 'Enter' && handleRetrieve()}
          />
        </div>
        <button type="button" className="btn retrieve-btn" onClick={handleRetrieve}>
           Retrieve
        </button>
      </div>

      <form className="student-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label>Name</label>
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            placeholder="Email"
          />
        </div>

        <div className="form-group">
          <label>DOB</label>
          <input name="dob" value={formData.dob} onChange={handleChange} type="date" />
        </div>

        <div className="form-group image-row">
          <label>Upload Image</label>
          <div className="image-upload-preview">
            <div className="upload-btn-wrapper">
              <label htmlFor="studentImage" className="custom-file">Choose File</label>
              <input type="file" id="studentImage" accept=".jpg,.jpeg,.png" onChange={handleFileChange} />
              {fileName && <p className="file-name">Selected file: {fileName}</p>}
              {errors.image && <span className="error-msg">{errors.image}</span>}
            </div>

            {formData.image && (
              <div className="image-preview">
                <img src={formData.image} alt="Preview" />
              </div>
            )}
          </div>
        </div>

        <div className="form-buttons">
          <button type="button" className="btn update-btn" onClick={handleUpdate}>
            Update
          </button>
          <button type="button" className="btn delete-btn" onClick={handleDelete}>
            <FaTrash /> Delete
          </button>
        </div>
      </form>
    </div>
  );
}
