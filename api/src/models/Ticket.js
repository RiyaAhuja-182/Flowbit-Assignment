const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Done'], 
    default: 'Pending' 
  },
  customerId: { 
    type: String, 
    required: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, {
  timestamps: true
});

// Index for tenant isolation
ticketSchema.index({ customerId: 1 });

// Static method to find tickets by customer
ticketSchema.statics.findByCustomer = function(customerId) {
  return this.find({ customerId });
};

module.exports = mongoose.model('Ticket', ticketSchema);
