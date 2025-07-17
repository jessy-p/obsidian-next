---
title: "API Design Best Practices"
tags: ["backend", "api", "rest", "design", "architecture"]
date: "2024-02-10"
description: "Comprehensive guide to designing robust and scalable APIs"
---

# API Design Best Practices

Well-designed APIs are the backbone of modern applications. They should be intuitive, consistent, and scalable.

## RESTful API Principles

### HTTP Methods and Status Codes

```javascript
// GET - Retrieve data
GET /api/users/123
// Response: 200 OK

// POST - Create new resource
POST /api/users
// Request body: { "name": "John", "email": "john@example.com" }
// Response: 201 Created

// PUT - Update entire resource
PUT /api/users/123
// Request body: { "name": "John Doe", "email": "john.doe@example.com" }
// Response: 200 OK or 204 No Content

// PATCH - Partial update
PATCH /api/users/123
// Request body: { "name": "John Doe" }
// Response: 200 OK

// DELETE - Remove resource
DELETE /api/users/123
// Response: 204 No Content
```

### URL Structure

```javascript
// Good: Resource-based URLs
GET /api/users                    // Get all users
GET /api/users/123                // Get specific user
GET /api/users/123/posts          // Get user's posts
POST /api/users/123/posts         // Create post for user

// Bad: Action-based URLs
GET /api/getUsers
GET /api/getUserById/123
POST /api/createUserPost/123
```

## Request/Response Design

### Request Structure

```javascript
// POST /api/users
{
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "profile": {
      "bio": "Software engineer",
      "location": "San Francisco"
    }
  }
}

// Query parameters for filtering
GET /api/users?status=active&role=admin&limit=10&offset=0
```

### Response Structure

```javascript
// Successful response
{
  "success": true,
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "meta": {
    "version": "1.0",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  },
  "meta": {
    "version": "1.0",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## Authentication and Authorization

### JWT Authentication

```javascript
// Middleware for JWT validation
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'MISSING_TOKEN', message: 'Access token required' }
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
      });
    }
    req.user = user;
    next();
  });
};

// Usage
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Access granted', user: req.user });
});
```

### Role-Based Access Control

```javascript
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'INSUFFICIENT_PERMISSIONS', message: 'Access denied' }
      });
    }
    next();
  };
};

// Usage
app.delete('/api/users/:id', 
  authenticateToken, 
  requireRole(['admin']), 
  deleteUser
);
```

## Error Handling

### Consistent Error Responses

```javascript
class APIError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  
  if (err instanceof APIError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid request data';
  }
  
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};
```

## Pagination and Filtering

```javascript
// Pagination helper
const paginate = (query, { page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  return {
    ...query,
    limit: parseInt(limit),
    offset: parseInt(offset)
  };
};

// API endpoint with pagination
app.get('/api/users', async (req, res) => {
  try {
    const { page, limit, status, role } = req.query;
    
    // Build query
    let query = {};
    if (status) query.status = status;
    if (role) query.role = role;
    
    // Apply pagination
    const paginatedQuery = paginate(query, { page, limit });
    
    const users = await User.findAndCountAll(paginatedQuery);
    const totalPages = Math.ceil(users.count / limit);
    
    res.json({
      success: true,
      data: users.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: users.count,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
});
```

## API Versioning

```javascript
// URL versioning
app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);

// Header versioning
const versionMiddleware = (req, res, next) => {
  const version = req.headers['api-version'] || '1.0';
  req.apiVersion = version;
  next();
};
```

## Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  }
});

app.use('/api/', limiter);
```

## Documentation

```javascript
// OpenAPI/Swagger documentation
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
```

## Testing APIs

```javascript
// API testing with Jest and Supertest
const request = require('supertest');
const app = require('../app');

describe('Users API', () => {
  describe('GET /api/users', () => {
    it('should return list of users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
    
    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=5')
        .expect(200);
      
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });
});
```

## Related Topics

This connects to [[caching-strategies]] and [[database-optimization]].

For frontend integration, see [[javascript/async-programming]].

Security considerations are covered in [[architecture/security-best-practices]].

#backend #api #rest #design #architecture