const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs'); // Import the fs module

const app = express();
const port = 3004;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const path = 'C:\\Users\\K.H.GOKULKANNAN\\Desktop\\Nithra_App_internship_2.05.2024\\CRUD OPERATIONS USING MYSQL,NODE.JS\\storedfiles';
    fs.existsSync(path) || fs.mkdirSync(path, { recursive: true }); // Ensure this directory exists
    cb(null, path);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'student',
  database: 'mydatabase'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to MySQL database');
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint to handle login requests with resume upload
app.post('/login', upload.single('resume'), (req, res) => {
  const { username, password } = req.body;
  const resume = req.file;

  // Check if the username already exists
  const checkSql = 'SELECT * FROM users WHERE username = ?';
  db.query(checkSql, [username], (checkErr, checkResults) => {
    if (checkErr) {
      console.error(checkErr);
      res.status(500).send('Error checking username existence');
    } else if (checkResults.length > 0) {
      // Username already exists
      res.status(400).send('Username already exists');
    } else {
      // Username doesn't exist, insert user into the database
      const insertSql = 'INSERT INTO users (username, password, resume_path) VALUES (?, ?, ?)';
      db.query(insertSql, [username, password, resume.path], (insertErr, result) => {
        if (insertErr) {
          console.error(insertErr);
          res.status(500).send('Error saving user credentials');
        } else {
          console.log('User credentials saved with resume');
          res.status(200).send('User registered successfully');
        }
      });
    }
  });
});

// Endpoint to fetch all users
app.get('/users', (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error fetching users');
    } else {
      res.status(200).json(results);
    }
  });
});

// Endpoint to delete a user by ID
app.delete('/users/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'DELETE FROM users WHERE id = ?';
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error deleting user');
    } else {
      console.log(`User with ID ${userId} deleted successfully`);
      res.status(200).send(`User with ID ${userId} deleted successfully`);
    }
  });
});

// Endpoint to update a user by ID
app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  const { username } = req.body;

  // Check if the new username already exists
  const checkSql = 'SELECT * FROM users WHERE username = ? AND id != ?';
  db.query(checkSql, [username, userId], (checkErr, checkResults) => {
    if (checkErr) {
      console.error(checkErr);
      res.status(500).send('Error checking username existence');
    } else if (checkResults.length > 0) {
      // Username already exists
      res.status(400).send('Username already exists');
    } else {
      // Update user with the new username
      const updateSql = 'UPDATE users SET username = ? WHERE id = ?';
      db.query(updateSql, [username, userId], (updateErr, result) => {
        if (updateErr) {
          console.error(updateErr);
          res.status(500).send('Error updating user');
        } else {
          console.log(`User with ID ${userId} updated successfully`);
          res.status(200).send(`User with ID ${userId} updated successfully`);
        }
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
