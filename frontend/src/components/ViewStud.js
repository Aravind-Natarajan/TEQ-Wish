import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ViewStud.css';
import { FaDownload, FaBirthdayCake } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';


export default function ViewStud() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showNoData, setShowNoData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: '',
    reg: '',
    startDate: '',
    endDate: '',
    month: ''
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://teq-wish.onrender.com/api/students');
      setStudents(res.data);
      setFiltered(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching students:', err);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApply = () => {
    let result = [...students];

    if (filters.name) {
      result = result.filter(s => s.name.toLowerCase().includes(filters.name.toLowerCase()));
    }
    if (filters.reg) {
      result = result.filter(s => s.regNo.toLowerCase().includes(filters.reg.toLowerCase()));
    }
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      const startMonth = start.getMonth(); // 0-based
      const startDate = start.getDate();

      result = result.filter(s => {
        const dob = new Date(s.dob);
        return (
          dob.getMonth() > startMonth ||
          (dob.getMonth() === startMonth && dob.getDate() >= startDate)
        );
      });
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      const endMonth = end.getMonth();
      const endDate = end.getDate();

      result = result.filter(s => {
        const dob = new Date(s.dob);
        return (
          dob.getMonth() < endMonth ||
          (dob.getMonth() === endMonth && dob.getDate() <= endDate)
        );
      });
    }

    if (filters.month) {
      result = result.filter(s => new Date(s.dob).toLocaleString('default', { month: 'long' }) === filters.month);
    }

    setFiltered(result);
  };

  const handleDownload = async () => {
    try {
      const minimalData = filtered.map(({ name, regNo, dob, email, image }) => ({
        name, regNo, dob, email, image
      }));

      const response = await axios.post(
        'https://teq-wish.onrender.com/api/students/download',
        minimalData,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'application/zip' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'students.zip';
      document.body.appendChild(link);
      link.click();
      setShowConfirmModal(false);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed', err);
      alert('Failed to download files.');
    }
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
  };

  const sendBirthdayWishes = async () => {
    setShowConfirm(false); // Close modal

    if (filtered.length === 0) {
      alert("No students to send wishes.");
      return;
    }

    try {
      const res = await axios.post('https://teq-wish.onrender.com/api/students/birthday', {
        students: filtered,
      });

      if (res.status === 200) {
        alert("Birthday wishes sent successfully!");
        confetti({
          angle: 90,
          spread: 360,
          startVelocity: 60,
          particleCount: 800,
          origin: { x: 0.5, y: 0.5 }

        });
      } else {
        alert("Failed to send birthday wishes.");
      }
    } catch (err) {
      console.error("Error sending birthday wishes:", err);
      alert("An error occurred while sending birthday wishes.");
    }
  };







  useEffect(() => {
    if (filtered.length === 0) {
      setShowNoData(true);
    } else {
      setShowNoData(false);
    }
  }, [filtered]);

  return (
    <div className="view-stud-container">
      <div className="filter-section">
        <div className="filter-row">
          <input type="text" name="name" value={filters.name} onChange={handleChange} placeholder="Name" />
          <input type="text" name="reg" value={filters.reg} onChange={handleChange} placeholder="Register No" />
          <input type="date" name="startDate" value={filters.startDate} onChange={handleChange} />
          <input type="date" name="endDate" value={filters.endDate} onChange={handleChange} />
          <select name="month" value={filters.month} onChange={handleChange}>
            <option value="" disabled>All Months</option>
            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button onClick={handleApply}>Apply</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">

            <div class="loader">
              <div class="loading-text">
                Loading<span class="dot">.</span><span class="dot">.</span
                ><span class="dot">.</span>
              </div>
              <div class="loading-bar-background">
                <div class="loading-bar">
                  <div class="white-bars-container">
                    <div class="white-bar"></div>
                    <div class="white-bar"></div>
                    <div class="white-bar"></div>
                    <div class="white-bar"></div>
                    <div class="white-bar"></div>
                    <div class="white-bar"></div>
                    <div class="white-bar"></div>
                    <div class="white-bar"></div>
                    <div class="white-bar"></div>
                    <div class="white-bar"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
      ) : showNoData ? (
        <p>No data found...</p>
      ) :
        <div className="student-grid">
          {filtered.map((student, index) => (
            <div
              className="student-card"
              key={index}
              onClick={() => navigate('/admin/update', { state: student })}
            >
              <div className="student-img-wrapper">
                <img src={student.image} alt={student.name} className="student-img" />
              </div>
              <div className="student-details">
                <h3>{student.name}</h3>
                <p>Reg No: {student.regNo}</p>
                <p>DOB: {new Date(student.dob).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>}





      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Are you sure you want to download the student data?</p>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
              <button className="wish-btn" onClick={handleDownload}>Download</button>
            </div>
          </div>
        </div>
      )}


      <div className="floating-buttons">
        <button className="floating-btn download-btn" onClick={() => setShowConfirmModal(true)} title="Download">
          <FaDownload size={20} />
        </button>


        {/* Floating Button */}
        <button className="floating-btn birthday-btn" onClick={() => setShowConfirm(true)} title="Birthday">
          <FaBirthdayCake size={20} />
        </button>

        {/* 🎂 Confirmation Popup */}
        {showConfirm && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Send birthday wishes to students?</h3>
              <div className="modal-buttons">
                <button onClick={() => setShowConfirm(false)} className="cancel-btn">Cancel</button>
                <button onClick={sendBirthdayWishes} className="wish-btn">Wish</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>


  );
}
