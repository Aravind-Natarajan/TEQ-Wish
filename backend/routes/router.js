const express = require('express');
const Student = require('../models/Student');
const ExcelJS = require('exceljs');
const archiver = require('archiver');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const nodemailer = require('nodemailer');
const router = express.Router();
const cron = require('node-cron');
const moment = require('moment');
const dotenv = require('dotenv');




// GET all students
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// (Optional) POST a student
router.post('/students', async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(200).json(newStudent);
  } catch (err) {
    res.status(400).json({ error: 'err.message' });
  }
});

// Get student by regNo
router.get('/students/:regNo', async (req, res) => {
  try {
    const student = await Student.findOne({ regNo: req.params.regNo });
    if (!student) return res.status(404).json({ message: 'Not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update student
router.put('/students/:regNo', async (req, res) => {
  try {
    const updated = await Student.findOneAndUpdate({ regNo: req.params.regNo }, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: 'Student not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete student
router.delete('/students/:regNo', async (req, res) => {
  try {
    const deleted = await Student.findOneAndDelete({ regNo: req.params.regNo });
    if (!deleted) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

//get today birthday stars
router.get('/birthday-today', async (req, res) => {
  try {
    const students = await Student.find();
    const today = new Date();
    const filtered = students.filter((student) => {
      const dob = new Date(student.dob);
      return dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth();
    });
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});



//Excel format

router.post('/students/download', async (req, res) => {
  try {
    const students = req.body;

    const tempDir = path.join(__dirname, '../temp');
    const imageDir = path.join(tempDir, 'images');
    await fs.remove(tempDir);
    await fs.ensureDir(imageDir);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Students');
    sheet.columns = [
      { header: 'Name', key: 'name' },
      { header: 'Register No', key: 'regNo' },
      { header: 'DOB', key: 'dob' },
      { header: 'Email', key: 'email' },
      { header: 'Image File', key: 'image' },
    ];

    const formatDate = (dobStr) => {
      const d = new Date(dobStr);
      return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    };

    for (const s of students) {
      const imgName = `${s.regNo} ${s.name.toUpperCase()}.jpg`;
      const imgPath = path.join(imageDir, imgName);

      if (s.image.startsWith('data:image')) {
        const base64 = s.image.split(',')[1];
        await fs.writeFile(imgPath, Buffer.from(base64, 'base64'));
      } else if (s.image.startsWith('http')) {
        try {
          const response = await axios.get(s.image, { responseType: 'arraybuffer' });
          await fs.writeFile(imgPath, response.data);
        } catch {
          console.log('Image download failed for', s.name);
        }
      }

      sheet.addRow({
        name: s.name,
        regNo: s.regNo,
        dob: formatDate(s.dob),
        email: s.email,
        image: imgName,
      });
    }

    const excelPath = path.join(tempDir, 'students.xlsx');
    await workbook.xlsx.writeFile(excelPath);

    const zipPath = path.join(tempDir, 'students.zip');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => res.download(zipPath));
    archive.on('error', err => { throw err });

    archive.pipe(output);
    archive.file(excelPath, { name: 'students.xlsx' });
    archive.directory(imageDir, 'images');
    archive.finalize();

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error while downloading');
  }
});

//Manual wish 

router.post('/students/birthday', async (req, res) => {
  const { students } = req.body;

  if (!students || students.length === 0) {
    return res.status(400).json({ error: 'No students provided' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  try {
    const emailPromises = students.map((student) => {
      const mailOptions = {
        from: 't4teqkattur@gmail.com',
        to: student.email,
        subject: '🎂 Happy Birthday from T4TEQ!',
        html: `
          <div style="font-family:Arial; padding:20px; border:1px solid #ddd;">
            <h2 style="color:#007BFF;">Happy Birthday, ${student.name}!</h2>
            <p>Wishing you all the success, happiness, and health on your special day! 🎉</p>
            <img src="cid:poster" style="width:100%; max-width:400px; margin-top:20px;" />
            <p style="margin-top:20px;">- T4TEQ Team</p>
          </div>
        `,
        attachments: [{
          filename: 'birthday.png',
          path: path.join(__dirname, '../assets/birthday.png'),
          cid: 'poster',
        }]
      };

      return transporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);

    res.status(200).json({ message: 'Birthday wishes sent' });
  } catch (err) {
    console.error('Error sending birthday wishes:', err);
    res.status(500).json({ error: 'Failed to send birthday emails' });
  }
});

//Automate Email send

//Cron: Runs at 12:00 AM daily
cron.schedule('0 0 * * *', async () => {
  console.log('⏰ Running birthday scheduler...');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  try {
    const today = moment();
    const students = await Student.find();

    const birthdayBabies = students.filter(s => {
      const dob = moment(s.dob);
      return dob.date() === today.date() && dob.month() === today.month();
    });

    if (birthdayBabies.length === 0) {
      console.log("🎂 No birthdays today.");
      return;
    }

    const emailPromises = birthdayBabies.map((student) => {
      const mailOptions = {
        from: 't4teqkattur@gmail.com',
        to: student.email,
        subject: '🎂 Happy Birthday from T4TEQ!',
        html: `
          <div style="font-family:Arial; padding:20px; border:1px solid #ddd;">
            <h2 style="color:#007BFF;">Happy Birthday, ${student.name}!</h2>
            <p>Wishing you all the success, happiness, and health on your special day! 🎉</p>
            <img src="cid:poster" style="width:100%; max-width:400px; margin-top:20px;" />
            <p style="margin-top:20px;">- T4TEQ Team</p>
          </div>
        `,
        attachments: [{
          filename: 'birthday.png',
          path: path.join(__dirname, '../assets/birthday.png'),
          cid: 'poster',
        }],
      };

      return transporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);
    console.log(`🎉 Sent birthday emails to ${birthdayBabies.length} students.`);

  } catch (err) {
    console.error("❌ Error in birthday scheduler:", err);
  }
});




module.exports = router;
