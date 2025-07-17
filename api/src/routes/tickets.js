const express = require('express');
const axios = require('axios');
const Ticket = require('../models/Ticket');
const Workflow = require('../models/Workflow');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/tickets - Create new ticket
router.post('/tickets', authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    
    // Create ticket
    const ticket = new Ticket({
      title,
      description,
      customerId: req.user.customerId,
      createdBy: req.user.userId
    });
    
    await ticket.save();
    
    // Create workflow record
    const workflow = new Workflow({
      ticketId: ticket._id,
      customerId: req.user.customerId,
      triggerData: { title, description }
    });
    
    await workflow.save();
    
    // Trigger n8n workflow
    try {
      const n8nResponse = await axios.post(process.env.N8N_URL, {
        ticketId: ticket._id.toString(),
        customerId: req.user.customerId,
        title,
        description,
        workflowId: workflow._id.toString()
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      // Update workflow with execution ID if provided
      if (n8nResponse.data?.executionId) {
        workflow.n8nExecutionId = n8nResponse.data.executionId;
        workflow.workflowStatus = 'processing';
        await workflow.save();
      }
      
    } catch (n8nError) {
      console.error('n8n trigger failed:', n8nError.message);
      workflow.workflowStatus = 'failed';
      await workflow.save();
    }
    
    res.status(201).json({
      ticket: {
        id: ticket._id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        createdAt: ticket.createdAt
      }
    });
    
  } catch (error) {
    console.error('Ticket creation error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// GET /api/tickets - List user's tickets
router.get('/tickets', authenticateToken, async (req, res) => {
  try {
    const tickets = await Ticket.findByCustomer(req.user.customerId)
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 });
    
    res.json({ tickets });
    
  } catch (error) {
    console.error('Ticket fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// GET /api/admin/tickets - Admin view of all tickets for tenant
router.get('/admin/tickets', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const tickets = await Ticket.findByCustomer(req.user.customerId)
      .populate('createdBy', 'email role')
      .sort({ createdAt: -1 });
    
    res.json({ tickets });
    
  } catch (error) {
    console.error('Admin ticket fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

module.exports = router;
