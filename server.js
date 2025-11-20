// Load environment variables from .env file (for local development only)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'pay4me_secret_key_2025'; // In production, use environment variables

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');
const OTP_FILE = path.join(DATA_DIR, 'otps.json');

// OTP storage (in-memory for demo, use Redis in production)
let otpStore = {};

// Load OTPs from file
if (fs.existsSync(OTP_FILE)) {
    try {
        const data = fs.readFileSync(OTP_FILE, 'utf8');
        otpStore = JSON.parse(data);
    } catch (error) {
        otpStore = {};
    }
}

// Save OTPs to file
function saveOTPs() {
    try {
        fs.writeFileSync(OTP_FILE, JSON.stringify(otpStore, null, 2));
    } catch (error) {
        console.error('Error saving OTPs:', error);
    }
}

// ==================== EMAIL & SMS CONFIGURATION ====================

// Debug: Check if environment variables are loaded
console.log('🔐 EMAIL_USER configured:', process.env.EMAIL_USER ? 'Yes ✓' : 'No ✗');
console.log('🔐 EMAIL_PASS configured:', process.env.EMAIL_PASS ? 'Yes ✓' : 'No ✗');

// Email transporter configuration (using Gmail as example)
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com', // Set in environment variables
        pass: process.env.EMAIL_PASS || 'your-app-password'     // Use App Password for Gmail
    }
});

// Send Email function
async function sendEmail(to, subject, html) {
    try {
        const mailOptions = {
            from: `"Pay4Me" <${process.env.EMAIL_USER || 'noreply@pay4me.com'}>`,
            to: to,
            subject: subject,
            html: html
        };
        
        await emailTransporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error('Email sending error:', error.message);
        return false;
    }
}

// Send SMS function (using Termii API - Popular in Nigeria)
async function sendSMS(phone, message) {
    try {
        const TERMII_API_KEY = process.env.TERMII_API_KEY;
        const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || 'Pay4Me';
        
        if (!TERMII_API_KEY) {
            console.log(`📱 SMS would be sent to ${phone}: ${message}`);
            return true; // Demo mode
        }
        
        const response = await axios.post('https://api.ng.termii.com/api/sms/send', {
            to: phone,
            from: TERMII_SENDER_ID,
            sms: message,
            type: 'plain',
            channel: 'generic',
            api_key: TERMII_API_KEY
        });
        
        console.log(`📱 SMS sent to ${phone}`);
        return true;
    } catch (error) {
        console.error('SMS sending error:', error.message);
        console.log(`📱 SMS Demo: Would send to ${phone}: ${message}`);
        return true; // Return true in demo mode
    }
}

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Load data from files or initialize empty arrays
let users = [];
let transactions = [];

// Load users from file
if (fs.existsSync(USERS_FILE)) {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        users = JSON.parse(data);
        console.log(`📚 Loaded ${users.length} users from database`);
    } catch (error) {
        console.log('⚠️ Error loading users, starting with empty database');
        users = [];
    }
}

// Load transactions from file
if (fs.existsSync(TRANSACTIONS_FILE)) {
    try {
        const data = fs.readFileSync(TRANSACTIONS_FILE, 'utf8');
        transactions = JSON.parse(data);
        console.log(`📚 Loaded ${transactions.length} transactions from database`);
    } catch (error) {
        console.log('⚠️ Error loading transactions, starting with empty database');
        transactions = [];
    }
}

// Helper function to save users to file
function saveUsers() {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving users:', error);
        return false;
    }
}

// Helper function to save transactions to file
function saveTransactions() {
    try {
        fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving transactions:', error);
        return false;
    }
}

// Helper function to generate transaction reference
function generateReference() {
    return 'PAY4ME-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// ==================== AUTHENTICATION ROUTES ====================

// Send OTP endpoint
app.post('/api/auth/send-otp', async (req, res) => {
    try {
        const { email, phone, type } = req.body; // type: 'email' or 'phone'

        if (!email && !phone) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email or phone number required' 
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const identifier = email || phone;
        
        // Store OTP with 5 minute expiry
        otpStore[identifier] = {
            otp: otp,
            expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes
            type: type || 'email'
        };
        
        saveOTPs();

        // Send OTP via email or SMS
        let sent = false;
        if (type === 'email' && email) {
            const emailHTML = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f4f7f9; border-radius: 10px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0;">💳 Pay4Me</h1>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #333;">Email Verification Code</h2>
                        <p style="color: #666; font-size: 16px;">Hello! Your verification code is:</p>
                        <div style="background: #f0f4ff; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                            <h1 style="color: #667eea; font-size: 36px; margin: 0; letter-spacing: 5px;">${otp}</h1>
                        </div>
                        <p style="color: #666; font-size: 14px;">This code will expire in <strong>5 minutes</strong>.</p>
                        <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px; text-align: center;">© 2025 Pay4Me. All rights reserved.</p>
                    </div>
                </div>
            `;
            sent = await sendEmail(email, 'Pay4Me - Email Verification Code', emailHTML);
        } else if (type === 'phone' && phone) {
            const smsMessage = `Your Pay4Me verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`;
            sent = await sendSMS(phone, smsMessage);
        }

        console.log(`📧 OTP for ${identifier}: ${otp}`);
        
        // Only show OTP in demo mode (when no email/SMS credentials are set)
        const isDemoMode = !process.env.EMAIL_USER && !process.env.TERMII_API_KEY;
        
        res.json({ 
            success: true, 
            message: `OTP sent to your ${type || 'email'}. ${isDemoMode ? 'Demo Mode - Check console for OTP.' : 'Check your ' + (type === 'email' ? 'email inbox' : 'phone messages') + '!'}`,
            // Only show OTP in demo mode for testing
            ...(isDemoMode && { otp: otp })
        });
    } catch (error) {
        console.error('OTP sending error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send OTP' 
        });
    }
});

// Verify OTP endpoint
app.post('/api/auth/verify-otp', (req, res) => {
    try {
        const { email, phone, otp } = req.body;
        const identifier = email || phone;

        if (!identifier || !otp) {
            return res.status(400).json({ 
                success: false, 
                message: 'Identifier and OTP required' 
            });
        }

        const storedOTP = otpStore[identifier];

        if (!storedOTP) {
            return res.status(400).json({ 
                success: false, 
                message: 'No OTP found. Please request a new one.' 
            });
        }

        // Check expiry
        if (Date.now() > storedOTP.expiresAt) {
            delete otpStore[identifier];
            saveOTPs();
            return res.status(400).json({ 
                success: false, 
                message: 'OTP expired. Please request a new one.' 
            });
        }

        // Verify OTP
        if (storedOTP.otp !== otp) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid OTP. Please try again.' 
            });
        }

        // OTP verified successfully
        delete otpStore[identifier];
        saveOTPs();

        res.json({ 
            success: true, 
            message: 'OTP verified successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to verify OTP' 
        });
    }
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Validate input
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        // Check if user already exists
        if (users.find(u => u.email === email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }

        // Hash password (using crypto - for demo purposes only)
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        // Create user
        const user = {
            id: users.length + 1,
            name,
            email,
            phone,
            password: hashedPassword,
            registeredAt: new Date().toISOString()
        };

        users.push(user);
        
        // Save users to file
        saveUsers();

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name }, 
            SECRET_KEY, 
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Registration successful',
            token,
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error during registration' 
        });
    }
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }

        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Verify password (hash and compare)
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        if (hashedPassword !== user.password) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name }, 
            SECRET_KEY, 
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
});

// ==================== AIRTIME ROUTES ====================

app.post('/api/airtime/purchase', authenticateToken, (req, res) => {
    try {
        const { network, phone, amount } = req.body;

        // Validate input
        if (!network || !phone || !amount) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        // Create transaction
        const transaction = {
            id: transactions.length + 1,
            reference: generateReference(),
            userId: req.user.id,
            type: 'airtime',
            network: network.toUpperCase(),
            phone,
            amount: parseFloat(amount),
            status: 'successful',
            createdAt: new Date().toISOString()
        };

        transactions.push(transaction);
        
        // Save transactions to file
        saveTransactions();

        res.json({
            success: true,
            message: `₦${amount} airtime recharge to ${phone} on ${network.toUpperCase()} successful`,
            transaction
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Transaction failed' 
        });
    }
});

// ==================== DATA ROUTES ====================

app.post('/api/data/purchase', authenticateToken, (req, res) => {
    try {
        const { network, phone, plan, planText } = req.body;

        // Validate input
        if (!network || !phone || !plan) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        // Create transaction
        const transaction = {
            id: transactions.length + 1,
            reference: generateReference(),
            userId: req.user.id,
            type: 'data',
            network: network.toUpperCase(),
            phone,
            plan,
            planText,
            status: 'successful',
            createdAt: new Date().toISOString()
        };

        transactions.push(transaction);
        
        // Save transactions to file
        saveTransactions();

        res.json({
            success: true,
            message: `${planText} purchase for ${phone} on ${network.toUpperCase()} successful`,
            transaction
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Transaction failed' 
        });
    }
});

// ==================== BETTING ROUTES ====================

app.post('/api/betting/fund', authenticateToken, (req, res) => {
    try {
        const { platform, userId, amount } = req.body;

        // Validate input
        if (!platform || !userId || !amount) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        const platformNames = {
            'sportybet': 'SportyBet',
            '1xbet': '1xBet',
            'bet9ja': 'Bet9ja'
        };

        // Create transaction
        const transaction = {
            id: transactions.length + 1,
            reference: generateReference(),
            userId: req.user.id,
            type: 'betting',
            platform: platformNames[platform],
            bettingUserId: userId,
            amount: parseFloat(amount),
            status: 'successful',
            createdAt: new Date().toISOString()
        };

        transactions.push(transaction);
        
        // Save transactions to file
        saveTransactions();

        res.json({
            success: true,
            message: `₦${amount} funding to ${platformNames[platform]} account ${userId} successful`,
            transaction
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Transaction failed' 
        });
    }
});

// ==================== TV SUBSCRIPTION ROUTES ====================

app.post('/api/tv/subscribe', authenticateToken, (req, res) => {
    try {
        const { provider, smartcard, packageValue, packageText } = req.body;

        // Validate input
        if (!provider || !smartcard || !packageValue) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        // Create transaction
        const transaction = {
            id: transactions.length + 1,
            reference: generateReference(),
            userId: req.user.id,
            type: 'tv',
            provider: provider.toUpperCase(),
            smartcard,
            package: packageValue,
            packageText,
            status: 'successful',
            createdAt: new Date().toISOString()
        };

        transactions.push(transaction);
        
        // Save transactions to file
        saveTransactions();

        res.json({
            success: true,
            message: `${packageText} subscription for smartcard ${smartcard} successful`,
            transaction
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Transaction failed' 
        });
    }
});

// ==================== TRANSACTION HISTORY ====================

app.get('/api/transactions', authenticateToken, (req, res) => {
    try {
        const userTransactions = transactions.filter(t => t.userId === req.user.id);
        res.json({
            success: true,
            transactions: userTransactions
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch transactions' 
        });
    }
});

// ==================== CUSTOMER SUPPORT ====================

let supportTickets = [];

// Load support tickets from file
const SUPPORT_FILE = path.join(DATA_DIR, 'support.json');
if (fs.existsSync(SUPPORT_FILE)) {
    try {
        const data = fs.readFileSync(SUPPORT_FILE, 'utf8');
        supportTickets = JSON.parse(data);
        console.log(`📚 Loaded ${supportTickets.length} support tickets from database`);
    } catch (error) {
        console.log('⚠️ Error loading support tickets, starting with empty database');
        supportTickets = [];
    }
}

// Helper function to save support tickets
function saveSupportTickets() {
    try {
        fs.writeFileSync(SUPPORT_FILE, JSON.stringify(supportTickets, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving support tickets:', error);
        return false;
    }
}

app.post('/api/support/submit', (req, res) => {
    try {
        const { name, email, phone, category, subject, message } = req.body;

        // Validate input
        if (!name || !email || !phone || !category || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        // Create support ticket
        const ticket = {
            id: supportTickets.length + 1,
            ticketId: 'SUP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
            name,
            email,
            phone,
            category,
            subject,
            message,
            status: 'open',
            createdAt: new Date().toISOString()
        };

        supportTickets.push(ticket);
        
        // Save support tickets to file
        saveSupportTickets();

        res.json({
            success: true,
            message: 'Support ticket submitted successfully',
            ticket: { ticketId: ticket.ticketId, status: ticket.status }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to submit support ticket' 
        });
    }
});

// ==================== PROFILE ROUTES ====================

// Get user profile
app.get('/api/profile', authenticateToken, (req, res) => {
    try {
        const user = users.find(u => u.email === req.user.email);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Return user data without password
        const { password, ...userData } = user;
        res.json({ 
            success: true, 
            user: userData 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Update user profile
app.put('/api/profile', authenticateToken, (req, res) => {
    try {
        const { name, phone, aboutMe, profilePicture } = req.body;
        
        const userIndex = users.findIndex(u => u.email === req.user.email);
        
        if (userIndex === -1) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Update user data
        if (name) users[userIndex].name = name;
        if (phone) users[userIndex].phone = phone;
        if (aboutMe !== undefined) users[userIndex].aboutMe = aboutMe;
        if (profilePicture !== undefined) users[userIndex].profilePicture = profilePicture;
        
        users[userIndex].updatedAt = new Date().toISOString();

        // Save users to file
        saveUsers();

        // Return updated user without password
        const { password, ...userData } = users[userIndex];
        
        res.json({ 
            success: true, 
            message: 'Profile updated successfully',
            user: userData 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Pay4Me API is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Pay4Me Backend Server running on http://localhost:${PORT}`);
    console.log(`� Data saved to: ${DATA_DIR}`);
    console.log(` API Endpoints:`);
    console.log(`   - POST /api/auth/register`);
    console.log(`   - POST /api/auth/login`);
    console.log(`   - POST /api/airtime/purchase`);
    console.log(`   - POST /api/data/purchase`);
    console.log(`   - POST /api/betting/fund`);
    console.log(`   - POST /api/tv/subscribe`);
    console.log(`   - GET  /api/transactions`);
    console.log(`   - POST /api/support/submit`);
    console.log(`   - GET  /api/health`);
});
