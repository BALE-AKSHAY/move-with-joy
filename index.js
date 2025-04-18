const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Spoorthi1@',
  database: 'mysite'
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to MySQL!');
  }
});


app.get('/check-pincode/:pincode', (req, res) => {
    const { pincode } = req.params;
  
    // 1️⃣ Run a SQL query to check if this pincode exists in the 'pincodes' table
    db.query(
      'SELECT available FROM pincodes WHERE pincode = ?',
      [pincode],
      (err, results) => {
        // 2️⃣ If there’s a DB error, send back 500 status
        if (err) {
          return res.status(500).send('Database error');
        }
  
        // 3️⃣ If no matching pincode found in DB, respond with 'no'
        if (results.length === 0) {
          return res.send({ pincode, available: 'no' });
        }
  
        // 4️⃣ If found, return whatever value is in the 'available' column ('yes' or 'no')
        res.send({ pincode, available: results[0].available });
      }
    );
  });
  app.post('/contact', (req, res) => {
    const { name, email, phone, address, message } = req.body;
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    const nameRegex = /^[A-Z][a-z]* [A-Z][a-z]*$/;
  
    if (!emailRegex.test(email)) {
      return res.status(400).send("Invalid email format.");
    }
    if (!phoneRegex.test(phone)) {
      return res.status(400).send("Phone number must be exactly 10 digits.");
    }
    if (!nameRegex.test(name)) {
      return res.status(400).send("Name must be two words with capitalized initials (e.g., John Doe).");
    }
  
    const sql = `
      INSERT INTO contact_submissions (name, email, phone, address, message)
      VALUES (?, ?, ?, ?, ?)
    `;
  
    db.query(sql, [name, email, phone, address, message], (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).send("Error saving contact submission.");
      }
      res.send("Thank you! Your message has been submitted.");
    });
  });
  

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
