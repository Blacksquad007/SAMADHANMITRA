const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');


const app = express();
const PORT = process.env.PORT || 8000;


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://shrivignesh:sih1286@atlascluster.pv8ypti.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

// Create a new model for the key signatory information
const KeySignatory = mongoose.model('KeySignatory', {
  firstName: String,
  middleName: String,
  lastName: String,
  email: String,
  phone: String,
  aadhar: String,
  dob: Date,
  state: String,
  city: String,
  pincode: String,
  filePath: String, // Add a field to store file path
});

// Create a new route to handle the POST request with file uploads
app.post('/save-key-signatory-file1', upload.single('idproof'), async (req, res) => {
  try {
    // Validate the required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone',];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `Missing required field: ${field}` });
      }
    }
    // Get the key signatory information from the POST request body
    const keySignatory = req.body;

    // Get the file path for the uploaded file
    const filePath = req.file.path;

    // Create a new key signatory record
    const newKeySignatory = new KeySignatory({
      firstName: keySignatory.firstName,
      middleName: keySignatory.middleName,
      lastName: keySignatory.lastName,
      email: keySignatory.email,
      phone: keySignatory.phone,
      aadhar: keySignatory.aadhar,
      dob: keySignatory.dob,
      state: keySignatory.state,
      city: keySignatory.city,
      pincode: keySignatory.pincode,
      filePath: filePath, // Store the file path in the database
    });

    // Save the key signatory record to the database
    await newKeySignatory.save();

    // Send a success response to the client
    res.status(201).json({ message: 'Key Signatory Saved!' });
  } catch (error) {
    console.error('Error saving key signatory:', error);
    let statusCode = 500;
    let message = 'Error saving key signatory.';
    if (error.name === 'ValidationError') {
      statusCode = 400;
      message = 'Invalid key signatory data.';
    } else if (error.name === 'MulterError') {
      statusCode = 400;
      message = 'Error uploading file.';
    }
    res.status(statusCode).json({ message });
  }
});

const AddSignatory= mongoose.model('AddSignatory', {
  firstName: String,
  middleName: String,
  lastName: String,
  email: String,
  phone: String,
  aadhar: String,
});

// Create a new route to handle the POST request
app.post('/save-Add-signatory', async (req, res) => {
  // Get the Add signatory information from the POST request body
  const addSignatory = req.body;
  

  // Create a new add signatory record from the POST request body
  const newAddSignatory = new AddSignatory({
    firstName: addSignatory.firstName,
    middleName: addSignatory.middleName,
    lastName: addSignatory.lastName,
    email: addSignatory.email,
    phone: addSignatory.phone,
    aadhar: addSignatory.aadhar,
  });

  // Save the add signatory record to the database
  await newAddSignatory.save();

  // Send a success response to the client
  res.status(201).json({ message: 'Add Signatory Saved!' });
});
const User = mongoose.model('User', {
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  password: String,
});


// Routes
app.post('/signup', async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(409).json({ message: 'User with this email already exists' });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
      });

      await user.save();

      res.status(201).json({ message: 'Registration successful' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Registration error', error: error.message });
  }
});

app.post('/login', async (req, res) => {
  const { email, password, userType } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        if (userType === 'user') {
          res.redirect('/impact/index.html');
        } else if (userType === 'admin') {
          res.redirect('/impact/sindex.html');
        } else {
          res.status(400).json({ message: 'Invalid userType' });
        }
      } else {
        res.status(401).json({ message: 'Password does not match' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
