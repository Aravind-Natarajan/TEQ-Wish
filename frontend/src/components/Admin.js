import React from 'react';
import {FaArrowLeft} from 'react-icons/fa';
import { GiPartyPopper } from 'react-icons/gi';
import { Link, Outlet } from 'react-router-dom';
import confetti from 'canvas-confetti';
import './Admin.css';

export default function Admin() {

  const handleLogoClick = () => {
    confetti({
      angle: 180,
      spread: 360,
      startVelocity: 60,
      particleCount: 800,
      origin: { x: 1, y: 0 }

    });
  }
  return (
    <div>
      <nav className="navbar">
        <div className="logo-container">
          <Link to="/home" className="logo-link">
            <FaArrowLeft className="back-icon" />
            <span className="site-title">TEQ Wish</span>
          </Link>
        </div>
        <div className="nav-links">
          {/* <button className="nav-button">
          <FaDownload className="nav-icon" />
          <span className="nav-text">Download</span>
        </button> */}
          {/* <FaGift className="nav-icon"/> */}
          {/* <button className="nav-button">
          <FaBirthdayCake className="nav-icon" />
          <span className="nav-text">Wish</span>
        </button> */}

          <button className="nav-button" onClick={handleLogoClick}>
            <GiPartyPopper size={25} />
          </button>

          {/* <FaBirthdayCake className="nav-icon" /> */}
        </div>
      </nav>
      <div className="dash-board">
        <div className='menu'>
          <div className='menu-title'>
            <h1>Menu</h1>
          </div>
          <Link to='view'><button>View Students</button></Link>
          <Link to='add'><button>Add Student</button></Link>
          <Link to='update'><button>Update Student</button></Link>
        </div>
        <div className='details'>
          <Outlet />
        </div>
      </div>
    </div>

  );
}
