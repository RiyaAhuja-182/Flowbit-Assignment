const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/me/screens
router.get('/me/screens', authenticateToken, (req, res) => {
  try {
    const registryPath = path.join(__dirname, '../config/registry.json');
    const registryData = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    
    // Find tenant configuration
    const tenantConfig = registryData.find(
      tenant => tenant.customerId === req.user.customerId.toLowerCase()
    );
    
    if (!tenantConfig) {
      return res.json({ screens: [] });
    }
    
    res.json({ 
      screens: tenantConfig.screens,
      customerId: req.user.customerId
    });
    
  } catch (error) {
    console.error('Error reading registry:', error);
    res.status(500).json({ error: 'Unable to load screen configuration' });
  }
});

module.exports = router;
