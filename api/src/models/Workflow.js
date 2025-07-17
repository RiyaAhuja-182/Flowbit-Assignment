const mongoose = require('mongoose');
const Schema = mongoose.Schema; // ✅ ADD THIS

const workflowSchema = new mongoose.Schema({
  ticketId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Ticket', 
    required: true 
  },
  customerId: { 
    type: String, 
    required: true 
  },
  workflowStatus: { 
    type: String, 
    enum: ['triggered', 'processing', 'completed', 'failed'], 
    default: 'triggered' 
  },
  n8nExecutionId: { 
    type: String 
  },
  triggerData: {
    type: Schema.Types.Mixed // now defined ✅
  },
  resultData: { 
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

workflowSchema.index({ customerId: 1, ticketId: 1 });

module.exports = mongoose.model('Workflow', workflowSchema);
