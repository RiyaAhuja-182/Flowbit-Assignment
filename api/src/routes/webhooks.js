const express = require('express');
const Ticket = require('../models/Ticket');
const Workflow = require('../models/Workflow');

const router = express.Router();

// POST /webhook/ticket-done - n8n callback
router.post('/ticket-done', async (req, res) => {
  try {
    const { ticketId, workflowId, secret, status = 'Done' } = req.body;
    
    // Validate shared secret
    const expectedSecret = process.env.SHARED_SECRET;
    if (!secret || secret !== expectedSecret) {
      return res.status(403).json({ error: 'Invalid shared secret' });
    }
    
    if (!ticketId) {
      return res.status(400).json({ error: 'Ticket ID is required' });
    }
    
    // Update ticket status
    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status },
      { new: true }
    );
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Update workflow status if workflowId provided
    if (workflowId) {
      await Workflow.findByIdAndUpdate(workflowId, {
        workflowStatus: 'completed',
        resultData: { ticketStatus: status, completedAt: new Date() }
      });
    }
    
    res.json({ 
      message: 'Ticket updated successfully',
      ticket: {
        id: ticket._id,
        status: ticket.status,
        updatedAt: ticket.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
