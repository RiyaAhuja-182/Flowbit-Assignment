# Flowbit Assignment - Multi-Service Monorepo

A comprehensive multi-tenant SaaS application demonstrating micro frontends, JWT authentication, tenant isolation, and workflow automation.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Flowbit System                          │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (Port 3000)          │  Micro Frontend (Port 3001)   │
│  ┌─────────────────────────┐    │  ┌─────────────────────────┐   │
│  │      React Client       │    │  │   Support Tickets App   │   │
│  │   - Authentication      │◄───┼──┤   - Ticket Creation     │   │
│  │   - Screen Registry     │    │  │   - Ticket Status       │   │
│  │   - Module Federation   │    │  │   - Micro Frontend      │   │
│  └─────────────────────────┘    │  └─────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                      Backend Services                          │
│  ┌─────────────────────────┐    │  ┌─────────────────────────┐   │
│  │     API Server          │    │  │       n8n Engine       │   │
│  │   - JWT Authentication  │◄───┼──┤   - Workflow Automation │   │
│  │   - Tenant Isolation    │    │  │   - Webhook Processing  │   │
│  │   - MongoDB Integration │    │  │   - Process Orchestration│  │
│  └─────────────────────────┘    │  └─────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                        Data Layer                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    MongoDB                                  │ │
│  │   - User Management (Multi-tenant)                         │ │
│  │   - Ticket Storage (Tenant Isolated)                       │ │
│  │   - Workflow Data                                           │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication with bcrypt password hashing
- Role-based access control (Admin/User)
- Tenant isolation ensuring data privacy between customers

### 🏢 Multi-Tenancy
- Two demo tenants: LogisticsCo and RetailGmbH
- Tenant-specific screen configurations
- Complete data isolation at the database level

### 🎯 Micro Frontends
- Module Federation with Webpack 5
- Dynamic loading of Support Tickets app
- Independent deployment and development

### 🔄 Workflow Automation
- n8n integration for ticket processing
- Webhook-based status updates
- Automated workflow triggers

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)

### 1. Clone and Start
```bash
git clone <repository-url>
cd flowbit-assignment
cp .env.example .env
docker-compose up --build
```

### 2. Seed Test Data
```bash
npm run seed
```

### 3. Access the Application
- **Client**: http://localhost:3000
- **API**: http://localhost:5001
- **Support Tickets**: http://localhost:3001
- **MongoDB**: localhost:27017
- **n8n**: http://localhost:5678

### 4. Login with Demo Accounts
- **LogisticsCo Admin**: admin@logisticsco.com / admin123
- **RetailGmbH Admin**: admin@retailgmbh.com / admin123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### User Data
- `GET /api/me/screens` - Get tenant-specific screen configuration

### Tickets
- `GET /api/tickets` - List user's tickets (tenant-isolated)
- `POST /api/tickets` - Create ticket (triggers n8n workflow)

### Admin Routes (Protected)
- `GET /api/admin/tickets` - List all tickets for tenant (admin only)

### Webhooks
- `POST /api/webhook/ticket-done` - n8n callback for ticket completion

## Development

### Local Development (without Docker)
```bash
# Terminal 1 - Start MongoDB
mongod

# Terminal 2 - Start API
cd api
npm install
npm run dev

# Terminal 3 - Start Client
cd client
npm install
npm start

# Terminal 4 - Start Support Tickets App
cd support-tickets-app
npm install
npm start

# Terminal 5 - Start n8n
npx n8n start --tunnel
```

### Running Tests
```bash
cd api
npm test
```

## Project Structure

```
flowbit-assignment/
├── api/                          # Node.js Express Backend
│   ├── scripts/seed.js          # Database seeding
│   ├── __tests__/               # Jest tests
│   └── server.js                # Main server file
├── client/                       # React Frontend Shell
│   ├── src/components/          # React components
│   ├── src/context/             # Authentication context
│   └── webpack.config.js        # Module Federation config
├── support-tickets-app/          # Micro Frontend
│   ├── src/App.js              # Tickets interface
│   └── webpack.config.js        # Module Federation config
├── docker-compose.yml           # Multi-service orchestration
└── README.md                    # This file
```

## Environment Variables

Copy `.env.example` to `.env` and customize:

- `JWT_SECRET` - Secret for JWT signing
- `MONGODB_URI` - MongoDB connection string
- `N8N_WEBHOOK_SECRET` - Shared secret for n8n webhooks
- `REACT_APP_API_URL` - API URL for frontend

## Security Features

### Tenant Isolation
- All database queries include `customerId` filtering
- JWT tokens contain tenant information
- Admin users can only access their tenant's data

### Authentication
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with 24-hour expiration
- Protected routes with middleware validation

## Testing

The project includes Jest tests demonstrating tenant isolation:

```bash
cd api
npm test
```

Key test: "Admin from Tenant A cannot read Tenant B data"

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 3001, 5001, 5678, 27017 are available
2. **Module Federation errors**: Check that Support Tickets app is running on port 3001
3. **MongoDB connection**: Verify MongoDB is running and accessible
4. **n8n webhooks**: Ensure n8n is configured with proper webhook endpoints

### Logs
```bash
# View all service logs
docker-compose logs

# View specific service logs
docker-compose logs api
docker-compose logs client
```

## Architecture Decisions

### Why Module Federation?
- Independent deployment of micro frontends
- Shared dependencies optimization
- Runtime composition of applications

### Why MongoDB?
- Flexible schema for multi-tenant data
- Easy tenant isolation with customerId field
- JSON document storage for complex ticket data

### Why n8n?
- Visual workflow builder
- Webhook integration
- Process automation capabilities

## Next Steps

- [ ] Add more comprehensive error handling
- [ ] Implement user management interface
- [ ] Add more sophisticated RBAC
- [ ] Create additional micro frontends
- [ ] Add monitoring and logging
- [ ] Implement proper CI/CD pipeline

## License

MIT License - see LICENSE file for details.
