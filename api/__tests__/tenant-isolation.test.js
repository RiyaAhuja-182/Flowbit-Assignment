const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Tenant Isolation', () => {
  let tenantAToken, tenantBToken;
  
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/flowbit-test');
    
    // Create test users
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin-a@tenanta.com',
        password: 'password123',
        customerId: 'TenantA',
        role: 'Admin'
      });
      
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin-b@tenantb.com',
        password: 'password123',
        customerId: 'TenantB',
        role: 'Admin'
      });
    
    // Login and get tokens
    const loginA = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin-a@tenanta.com',
        password: 'password123'
      });
    tenantAToken = loginA.body.token;
    
    const loginB = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin-b@tenantb.com',
        password: 'password123'
      });
    tenantBToken = loginB.body.token;
  });
  
  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });
  
  test('Admin from Tenant A cannot read Tenant B data', async () => {
    // Create ticket for Tenant B
    await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${tenantBToken}`)
      .send({
        title: 'Tenant B Ticket',
        description: 'This belongs to Tenant B'
      });
    
    // Try to access tickets as Tenant A admin
    const response = await request(app)
      .get('/api/admin/tickets')
      .set('Authorization', `Bearer ${tenantAToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0); // Should not see Tenant B's tickets
  });
});
