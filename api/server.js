const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import from new structure

const Ticket = require('./src/models/Ticket');
const User = require('./src/models/User');
// Import routes and middleware
const authRoutes = require('./src/routes/auth');
const screenRoutes = require('./src/routes/screens');
const ticketRoutes = require('./src/routes/tickets');
const webhookRoutes = require('./src/routes/webhooks');
const { authenticateToken, adminPathProtection } = require('./src/middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flowbit');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', screenRoutes);
app.use('/api', ticketRoutes);
app.use('/webhook', webhookRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('✅ Flowbit API is running!');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
// Screen registry
const screenRegistry = {
  "LogisticsCo": [
    { id: "dashboard", name: "Dashboard", path: "/dashboard" },
    { id: "tickets", name: "Support Tickets", path: "/tickets" },
    { id: "logistics", name: "Logistics Management", path: "/logistics" }
  ],
  "RetailGmbH": [
    { id: "dashboard", name: "Dashboard", path: "/dashboard" },
    { id: "tickets", name: "Support Tickets", path: "/tickets" },
    { id: "retail", name: "Retail Analytics", path: "/retail" }
  ]
};

// JWT Middleware
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};


// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, customerId, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      email,
      password: hashedPassword,
      customerId,
      role: role || 'User'
    });
    
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user._id, customerId: user.customerId, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    res.json({ token, user: { email: user.email, role: user.role, customerId: user.customerId } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Screens route
app.get('/api/me/screens', authenticateToken, (req, res) => {
  const screens = screenRegistry[req.user.customerId] || [];
  res.json({ screens });
});

// Tickets routes
app.post('/api/tickets', authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const ticket = new Ticket({
      title,
      description,
      customerId: req.user.customerId
    });
    
    await ticket.save();
    
    // Trigger n8n workflow
    try {
      await axios.post(process.env.N8N_WEBHOOK_URL || 'http://n8n:5678/webhook/ticket-created', {
        ticketId: ticket._id,
        customerId: req.user.customerId,
        title,
        description
      });
    } catch (n8nError) {
      console.log('n8n webhook failed:', n8nError.message);
    }
    
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/tickets', authenticateToken, async (req, res) => {
  try {
    const tickets = await Ticket.find({ customerId: req.user.customerId });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin routes
app.get('/api/admin/tickets', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const tickets = await Ticket.find({ customerId: req.user.customerId });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook for n8n callback
app.post('/api/webhook/ticket-done', (req, res) => {
  const { secret, ticketId } = req.body;
  
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return res.status(403).json({ error: 'Invalid secret' });
  }
  
  Ticket.findByIdAndUpdate(ticketId, { 
    status: 'done', 
    updatedAt: new Date() 
  })
    .then(() => res.json({ message: 'Ticket updated successfully' }))
    .catch(error => res.status(500).json({ error: error.message }));
});
app.get('/', (req, res) => {
  res.send('✅ Flowbit API is running!');
});
