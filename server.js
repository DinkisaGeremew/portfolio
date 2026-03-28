require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== SIMPLE JSON STORAGE =====
const dbFile = path.join(__dirname, 'messages.json');
function getMessages() {
  if (!fs.existsSync(dbFile)) return [];
  return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
}
function saveMessage(msg) {
  const messages = getMessages();
  messages.push({ ...msg, received_at: new Date().toISOString() });
  fs.writeFileSync(dbFile, JSON.stringify(messages, null, 2));
}

// ===== EMAIL =====
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ===== API ROUTES =====
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, user: process.env.EMAIL_USER });
});

app.get('/api/test-email', async (req, res) => {
  try {
    await transporter.verify();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.OWNER_EMAIL,
      subject: 'Portfolio Test Email',
      text: 'Email is working correctly.',
    });
    res.json({ success: true, message: 'Test email sent to ' + process.env.OWNER_EMAIL });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  saveMessage({ name, email, subject, message });

  try {
    await transporter.sendMail({
      from: `"Job Opportunity - Portfolio" <${process.env.EMAIL_USER}>`,
      to: process.env.OWNER_EMAIL,
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      html: `<p><b>Name:</b> ${name}</p>
             <p><b>Email:</b> ${email}</p>
             <p><b>Subject:</b> ${subject}</p>
             <p><b>Message:</b><br>${message.replace(/\n/g, '<br>')}</p>`,
    });
    console.log('Email sent from', name, email);
  } catch (err) {
    console.error('Email failed:', err.message);
    return res.json({ success: true, message: 'Message saved. Email notification failed.' });
  }

  res.json({ success: true, message: 'Message received. Thank you!' });
});

app.get('/api/messages', (req, res) => {
  res.json(getMessages());
});

// ===== SERVE FRONTEND =====
app.use(express.static(path.join(__dirname, '..')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
  console.log('Server running at http://localhost:' + PORT);
});
