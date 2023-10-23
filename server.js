const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 7000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('impact'));

// Set up MongoDB
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

// Define User model
const User = mongoose.model('User', {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    password: String,
    isVerified: Boolean,
    verificationCode: String,
});

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'samadhanmitra@gmail.com',
        pass: 'Samadhanmitra@47',
    },
});

app.use(express.static('public'));

// Send verification OTP to email
app.post('/send-verification-otp', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Generate a random verification code (e.g., a 6-digit code)
        const verificationCode = Math.floor(100000 + Math.random() * 900000);

        const mailOptions = {
            from: 'your_email@gmail.com',
            to: email,
            subject: 'Email Verification OTP',
            text: `Your OTP for email verification is: ${verificationCode}`,
        };

        await transporter.sendMail(mailOptions);

        // Update the user's verification code
        user.verificationCode = verificationCode;
        await user.save();

        res.status(200).json({ message: 'Verification OTP sent' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending verification OTP', error: error.message });
    }
});

// Verify OTP and allow login
app.post('/verify-otp-and-login', async (req, res) => {
    const { email, otp, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (user.verificationCode !== otp) {
            res.status(401).json({ message: 'Invalid OTP' });
            return;
        }

        // Mark the user as verified
        user.isVerified = true;
        await user.save();

        // Perform the login process (e.g., check password and redirect)
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Password does not match' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error verifying OTP and login', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
