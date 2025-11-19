const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'pay4me_secret_key_2025'; // In production, use environment variables

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');

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
