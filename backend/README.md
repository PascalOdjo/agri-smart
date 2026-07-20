# AgriSmart Togo - Backend API

Node.js + Express + MySQL backend for AgriSmart Togo application.

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file from template:

```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:

- MySQL database credentials
- JWT secret (change in production)
- Frontend URL for CORS

4. Run database migrations (coming soon):

```bash
npm run migrate
```

### Development

```bash
npm run dev
```

Server runs on `http://localhost:3000` by default.

### Production

```bash
npm start
```

## API Structure

### Authentication Routes

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/reset-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Confirm password reset

### User Routes

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users/:id` - Get user by ID (admin)

### Product Routes

- `GET /api/products` - List all products
- `POST /api/products` - Create product (farmer)
- `PUT /api/products/:id` - Update product (farmer)
- `DELETE /api/products/:id` - Delete product (farmer)

### Order Routes

- `GET /api/orders` - List user orders
- `POST /api/orders` - Create order (client)
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (farmer)

### Diagnostic Routes

- `POST /api/diagnostics` - Save diagnostic result
- `GET /api/diagnostics` - List user diagnostics
- `GET /api/diagnostics/:id` - Get diagnostic details

### File Upload Routes

- `POST /api/upload` - Upload file (image)
- `GET /api/uploads/:filename` - Get uploaded file

## Database Schema

See `supabase/migrations/` for current schema, will be migrated to MySQL.

## Environment Variables

| Variable       | Description     | Default               |
| -------------- | --------------- | --------------------- |
| `PORT`         | Server port     | 3000                  |
| `NODE_ENV`     | Environment     | development           |
| `DB_HOST`      | MySQL host      | localhost             |
| `DB_PORT`      | MySQL port      | 3306                  |
| `DB_USER`      | MySQL user      | root                  |
| `DB_PASSWORD`  | MySQL password  | -                     |
| `DB_NAME`      | Database name   | agri_smart            |
| `JWT_SECRET`   | JWT signing key | -                     |
| `FRONTEND_URL` | Frontend URL    | http://localhost:5173 |

## Project Structure

```
backend/
├── src/
│   ├── config/        # Configuration files (database, JWT)
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Sequelize models
│   ├── routes/         # API routes
│   ├── utils/          # Helper functions
│   └── server.js       # Express app entry point
├── uploads/            # File uploads directory
├── .env.example        # Environment template
├── package.json        # Dependencies
└── README.md
```

## Error Handling

Standard API error responses:

```json
{
    "success": false,
    "error": "Error message",
    "statusCode": 400
}
```

## Authentication

JWT-based authentication:

1. User registers/logs in
2. Server returns access token (short-lived)
3. Client includes token in `Authorization: Bearer <token>` header
4. Token validated by middleware on protected routes

## CORS

Configured to allow requests from `FRONTEND_URL`.

## Next Steps

- [ ] Set up MySQL database migrations
- [ ] Implement all auth endpoints
- [ ] Create database models
- [ ] Implement product/order endpoints
- [ ] Add file upload handler
- [ ] Add role-based access control
- [ ] Add input validation
- [ ] Add comprehensive error handling
- [ ] Set up logging
- [ ] Add rate limiting

## Voici les identifiants pour vous connecter à l'espace superadmin :

### Email : admin@agrismart.tg
### Mot de passe : admin123
