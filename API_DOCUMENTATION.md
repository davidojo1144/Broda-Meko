# BrodaMeko API Documentation

**Version:** 1.0.0  
**Base URL:** `/api/v1`  
**Date:** January 15, 2026

## Table of Contents

1. [Authentication](#authentication)
2. [Jobs](#jobs)
3. [Mechanics](#mechanics)
4. [Payments & Wallet](#payments--wallet)
5. [Locations](#locations)
6. [Chat](#chat)
7. [Notifications](#notifications)
8. [Spare Parts](#spare-parts)
9. [Orders](#orders)
10. [Admin](#admin)
11. [Error Responses](#error-responses)
12. [Data Models](#data-models)

---

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### User Roles

- `OWNER` - Vehicle owners requesting services
- `MECHANIC` - Mechanics providing services
- `SELLER` - Spare parts sellers
- `ADMIN` - Platform administrators

Users can have multiple roles.

### POST /auth/request-otp

Request OTP for phone number authentication.

**Access:** Public (rate limited)

**Request Body:**
```json
{
  "phoneNumber": "08012345678"
}
```

**Validation:**
- `phoneNumber`: Nigerian phone format (+234XXXXXXXXXX, 234XXXXXXXXXX, or 0XXXXXXXXXX)

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "expiresIn": 300
  }
}
```

**Error Responses:**
- `400` - Invalid phone number format
- `429` - Rate limit exceeded

---

### POST /auth/verify-otp

Verify OTP and receive authentication tokens.

**Access:** Public (rate limited)

**Request Body:**
```json
{
  "phoneNumber": "08012345678",
  "otp": "123456"
}
```

**Validation:**
- `phoneNumber`: Nigerian phone format
- `otp`: 6-digit numeric code

**Success Response (200):**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "sam@gmail.com",
      "roles": ["OWNER"],
      "isActive": true,
      "createdAt": "2026-01-15T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

**Error Responses:**
- `400` - Invalid OTP or phone number
- `401` - OTP expired or incorrect
- `429` - Rate limit exceeded

---

### POST /auth/refresh-token

Refresh access token using refresh token.

**Access:** Public (rate limited)

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

**Error Responses:**
- `401` - Invalid or expired refresh token
- `429` - Rate limit exceeded

---

### POST /auth/logout

Logout and revoke refresh tokens.

**Access:** Private (requires authentication)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /auth/me

Get current authenticated user details.

**Access:** Private (requires authentication)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "phoneNumber": "08012345678",
      "roles": ["OWNER", "MECHANIC"],
      "isActive": true,
      "verificationStatus": "VERIFIED",
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  }
}
```

---

## Jobs

All job endpoints require authentication. Owner-specific endpoints require `OWNER` role.

### POST /jobs

Create a new job request.

**Access:** Private (OWNER role required)

**Request Body:**
```json
{
  "coordinates": [3.3792, 6.5244],
  "address": "123 Ikeja Way, Lagos",
  "description": "Car won't start, battery seems dead",
  "photos": ["https://example.com/photo1.jpg"],
  "vehicleId": "507f1f77bcf86cd799439011",
  "priceEstimate": 5000
}
```

**Validation:**
- `coordinates`: Array of [longitude, latitude]
- `description`: 10-1000 characters (required)
- `photos`: Max 10 URLs (optional)
- `vehicleId`: Valid MongoDB ObjectId (optional)
- `priceEstimate`: Non-negative number (optional)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {
    "job": {
      "_id": "507f1f77bcf86cd799439011",
      "ownerId": "507f1f77bcf86cd799439012",
      "origin": {
        "type": "Point",
        "coordinates": [3.3792, 6.5244],
        "address": "123 Ikeja Way, Lagos"
      },
      "description": "Car won't start, battery seems dead",
      "state": "CREATED",
      "priceEstimate": 5000,
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden (not OWNER role)

---

### GET /jobs

Get owner's jobs with optional filtering.

**Access:** Private (OWNER role required)

**Query Parameters:**
- `state`: Filter by job state (CREATED, MATCHING, OFFERED, ACCEPTED, EN_ROUTE, ARRIVED, IN_PROGRESS, COMPLETED, ESCROW_PENDING, CLOSED, CANCELLED)
- `active`: Boolean - filter active jobs only
- `limit`: Number (1-100, default: 20)
- `skip`: Number (default: 0)

**Example:** `GET /jobs?state=ACCEPTED&limit=10`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "state": "ACCEPTED",
        "description": "Car won't start",
        "acceptedBy": {
          "_id": "507f1f77bcf86cd799439013",
          "phoneNumber": "08098765432"
        },
        "createdAt": "2026-01-15T10:00:00.000Z"
      }
    ],
    "total": 1
  }
}
```

---

### GET /jobs/stats

Get job statistics for owner.

**Access:** Private (OWNER role required)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "active": 2,
    "completed": 20,
    "cancelled": 3,
    "byState": {
      "CREATED": 1,
      "ACCEPTED": 1,
      "COMPLETED": 20,
      "CANCELLED": 3
    }
  }
}
```

---

### GET /jobs/active

Get owner's currently active job.

**Access:** Private (OWNER role required)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "job": {
      "_id": "507f1f77bcf86cd799439011",
      "state": "EN_ROUTE",
      "description": "Car won't start",
      "acceptedBy": {
        "_id": "507f1f77bcf86cd799439013",
        "phoneNumber": "08098765432"
      }
    }
  }
}
```

---

### GET /jobs/:id

Get job details by ID.

**Access:** Private (Owner or assigned Mechanic)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "job": {
      "_id": "507f1f77bcf86cd799439011",
      "ownerId": "507f1f77bcf86cd799439012",
      "state": "IN_PROGRESS",
      "description": "Car won't start",
      "origin": {
        "type": "Point",
        "coordinates": [3.3792, 6.5244],
        "address": "123 Ikeja Way, Lagos"
      },
      "acceptedBy": "507f1f77bcf86cd799439013",
      "priceEstimate": 5000,
      "timestamps": {
        "created": "2026-01-15T10:00:00.000Z",
        "accepted": "2026-01-15T10:05:00.000Z",
        "started": "2026-01-15T10:30:00.000Z"
      }
    }
  }
}
```

**Error Responses:**
- `404` - Job not found
- `403` - Forbidden (not job participant)

---

### POST /jobs/:id/cancel

Cancel a job.

**Access:** Private (OWNER role required)

**Request Body:**
```json
{
  "reason": "Found another mechanic"
}
```

**Validation:**
- `reason`: Max 500 characters (optional)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job cancelled successfully",
  "data": {
    "job": {
      "_id": "507f1f77bcf86cd799439011",
      "state": "CANCELLED",
      "cancellationReason": "Found another mechanic"
    }
  }
}
```

**Error Responses:**
- `400` - Cannot cancel job in current state
- `404` - Job not found

---

### POST /jobs/:id/accept

Accept a job offer (Mechanic action).

**Access:** Private (MECHANIC role required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job accepted successfully",
  "data": {
    "job": {
      "_id": "507f1f77bcf86cd799439011",
      "state": "ACCEPTED",
      "acceptedBy": "507f1f77bcf86cd799439013"
    }
  }
}
```

**Error Responses:**
- `400` - Job not in OFFERED state or already accepted
- `404` - Job not found

---

### POST /jobs/:id/decline

Decline a job offer (Mechanic action).

**Access:** Private (MECHANIC role required)

**Request Body:**
```json
{
  "reason": "Too far from my location"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job declined successfully"
}
```

---

### POST /jobs/:id/en-route

Mark mechanic as en route to job location.

**Access:** Private (MECHANIC role required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Status updated to en route",
  "data": {
    "job": {
      "_id": "507f1f77bcf86cd799439011",
      "state": "EN_ROUTE"
    }
  }
}
```

---

### POST /jobs/:id/arrive

Mark mechanic as arrived at job location.

**Access:** Private (MECHANIC role required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Status updated to arrived",
  "data": {
    "job": {
      "_id": "507f1f77bcf86cd799439011",
      "state": "ARRIVED"
    }
  }
}
```

---

### POST /jobs/:id/start

Start work on job.

**Access:** Private (MECHANIC role required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Work started",
  "data": {
    "job": {
      "_id": "507f1f77bcf86cd799439011",
      "state": "IN_PROGRESS"
    }
  }
}
```

---

### POST /jobs/:id/complete

Complete job.

**Access:** Private (MECHANIC role required)

**Request Body:**
```json
{
  "finalPrice": 5500,
  "notes": "Replaced battery and cleaned terminals"
}
```

**Validation:**
- `finalPrice`: Non-negative number (optional)
- `notes`: Max 1000 characters (optional)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job completed successfully",
  "data": {
    "job": {
      "_id": "507f1f77bcf86cd799439011",
      "state": "COMPLETED",
      "finalPrice": 5500
    }
  }
}
```

---

## Mechanics

All mechanic endpoints require authentication and MECHANIC role.

### GET /mechanics/profile

Get mechanic profile.

**Access:** Private (MECHANIC role required)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "profile": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "fullName": "John Doe",
      "businessName": "John's Auto Repair",
      "specializations": ["Engine", "Electrical"],
      "yearsOfExperience": 5,
      "isAvailable": true,
      "isOnline": true,
      "rating": 4.5,
      "totalJobs": 120
    }
  }
}
```

---

### POST /mechanics/profile

Create mechanic profile.

**Access:** Private (MECHANIC role required)

**Request Body:**
```json
{
  "fullName": "John Doe",
  "specializations": ["Engine", "Electrical"],
  "businessName": "John's Auto Repair",
  "yearsOfExperience": 5
}
```

**Validation:**
- `fullName`: Max 100 characters (optional)
- `specializations`: Array of strings (optional)
- `businessName`: Max 100 characters (optional)
- `yearsOfExperience`: Non-negative number (optional)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "profile": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "fullName": "John Doe",
      "businessName": "John's Auto Repair"
    }
  }
}
```

---

### PUT /mechanics/profile

Update mechanic profile.

**Access:** Private (MECHANIC role required)

**Request Body:**
```json
{
  "fullName": "John Doe",
  "avatarUrl": "https://example.com/avatar.jpg",
  "specializations": ["Engine", "Electrical", "Brakes"],
  "yearsOfExperience": 6
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "profile": {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "specializations": ["Engine", "Electrical", "Brakes"]
    }
  }
}
```

---

### PUT /mechanics/location

Update mechanic location.

**Access:** Private (MECHANIC role required)

**Request Body:**
```json
{
  "longitude": 3.3792,
  "latitude": 6.5244
}
```

**Validation:**
- `longitude`: -180 to 180 (required)
- `latitude`: -90 to 90 (required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Location updated successfully"
}
```

---

### PUT /mechanics/availability

Toggle mechanic availability.

**Access:** Private (MECHANIC role required)

**Request Body:**
```json
{
  "isAvailable": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Availability updated",
  "data": {
    "isAvailable": true
  }
}
```

---

### PUT /mechanics/online

Set mechanic online status.

**Access:** Private (MECHANIC role required)

**Request Body:**
```json
{
  "isOnline": true
}
```

**Validation:**
- `isOnline`: Boolean (required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Online status updated",
  "data": {
    "isOnline": true
  }
}
```

---

### POST /mechanics/fcm-token

Add FCM token for push notifications.

**Access:** Private (MECHANIC role required)

**Request Body:**
```json
{
  "token": "fcm_device_token_here"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "FCM token added successfully"
}
```

---

### DELETE /mechanics/fcm-token

Remove FCM token.

**Access:** Private (MECHANIC role required)

**Request Body:**
```json
{
  "token": "fcm_device_token_here"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "FCM token removed successfully"
}
```

---

### GET /mechanics/stats

Get mechanic statistics.

**Access:** Private (MECHANIC role required)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalJobs": 120,
    "completedJobs": 115,
    "cancelledJobs": 5,
    "averageRating": 4.5,
    "totalEarnings": 575000
  }
}
```

---

### GET /mechanics/jobs

Get mechanic's jobs.

**Access:** Private (MECHANIC role required)

**Query Parameters:**
- `state`: Filter by job state
- `limit`: Number (1-100, default: 20)
- `skip`: Number (default: 0)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "state": "COMPLETED",
        "description": "Car won't start",
        "finalPrice": 5500
      }
    ]
  }
}
```

---

### GET /mechanics/jobs/offered

Get jobs offered to mechanic.

**Access:** Private (MECHANIC role required)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "state": "OFFERED",
        "description": "Car won't start",
        "origin": {
          "coordinates": [3.3792, 6.5244],
          "address": "123 Ikeja Way, Lagos"
        },
        "priceEstimate": 5000
      }
    ]
  }
}
```

---

### GET /mechanics/jobs/active

Get mechanic's active job.

**Access:** Private (MECHANIC role required)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "job": {
      "_id": "507f1f77bcf86cd799439011",
      "state": "IN_PROGRESS",
      "description": "Car won't start",
      "ownerId": {
        "_id": "507f1f77bcf86cd799439012",
        "phoneNumber": "08012345678"
      }
    }
  }
}
```

---

### GET /mechanics/jobs/:id

Get job details.

**Access:** Private (MECHANIC role required)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "job": {
      "_id": "507f1f77bcf86cd799439011",
      "state": "ACCEPTED",
      "description": "Car won't start",
      "origin": {
        "coordinates": [3.3792, 6.5244],
        "address": "123 Ikeja Way, Lagos"
      },
      "priceEstimate": 5000
    }
  }
}
```

---

## Payments & Wallet

### GET /payments/wallet

Get user wallet details and balance.

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "wallet": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "balance": 50000,
      "currency": "NGN",
      "status": "ACTIVE",
      "totalDeposits": 100000,
      "totalWithdrawals": 50000
    }
  }
}
```

---

### POST /payments/wallet/topup

Generate payment link for wallet top-up.

**Access:** Private

**Request Body:**
```json
{
  "amount": 10000,
  "callbackUrl": "https://example.com/payment/callback"
}
```

**Validation:**
- `amount`: Positive integer in kobo (required)
- `callbackUrl`: Valid URL (optional)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "paymentLink": {
      "_id": "507f1f77bcf86cd799439011",
      "reference": "PAY_abc123xyz",
      "amount": 10000,
      "authorizationUrl": "https://checkout.paystack.com/abc123",
      "status": "PENDING",
      "expiresAt": "2026-01-15T11:00:00.000Z"
    }
  }
}
```

---

### GET /payments/wallet/transactions

Get user transaction history.

**Access:** Private

**Query Parameters:**
- `type`: Filter by type (DEPOSIT, WITHDRAWAL, TRANSFER, etc.)
- `status`: Filter by status (PENDING, COMPLETED, FAILED)
- `page`: Page number (default: 1)
- `limit`: Items per page (1-100, default: 20)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "type": "DEPOSIT",
        "amount": 10000,
        "status": "COMPLETED",
        "description": "Wallet top-up",
        "createdAt": "2026-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50
    }
  }
}
```

---

### GET /payments/wallet/summary

Get user transaction summary.

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalDeposits": 100000,
      "totalWithdrawals": 50000,
      "totalTransfers": 20000,
      "currentBalance": 30000,
      "pendingTransactions": 2
    }
  }
}
```

---

### POST /payments/wallet/transfer

Transfer funds to another user.

**Access:** Private

**Request Body:**
```json
{
  "recipientId": "507f1f77bcf86cd799439013",
  "amount": 5000,
  "description": "Payment for services"
}
```

**Validation:**
- `recipientId`: Valid MongoDB ObjectId (required)
- `amount`: Positive integer in kobo (required)
- `description`: Max 500 characters (optional)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transfer successful",
  "data": {
    "transaction": {
      "_id": "507f1f77bcf86cd799439011",
      "type": "TRANSFER",
      "amount": 5000,
      "status": "COMPLETED",
      "recipientId": "507f1f77bcf86cd799439013"
    }
  }
}
```

**Error Responses:**
- `400` - Insufficient balance
- `404` - Recipient not found

---

### GET /payments/wallet/verify

Verify wallet balance integrity.

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "balance": 50000,
    "calculatedBalance": 50000
  }
}
```

---

### GET /payments/wallet/payment/:reference

Get payment link status.

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "paymentLink": {
      "_id": "507f1f77bcf86cd799439011",
      "reference": "PAY_abc123xyz",
      "amount": 10000,
      "status": "COMPLETED",
      "paidAt": "2026-01-15T10:05:00.000Z"
    }
  }
}
```

---

### POST /payments/wallet/payment/:reference/cancel

Cancel payment link.

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment link cancelled successfully"
}
```

---

### POST /payments/webhook

Handle Paystack webhook events.

**Access:** Public (Paystack only - signature verified)

**Note:** This endpoint is called by Paystack to notify payment status changes. Not for direct client use.

---

### POST /payments/verify

Manually verify payment.

**Access:** Private

**Request Body:**
```json
{
  "reference": "PAY_abc123xyz"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "status": "COMPLETED",
    "amount": 10000
  }
}
```

---

### GET /payments/webhook/health

Webhook health check.

**Access:** Public

**Success Response (200):**
```json
{
  "success": true,
  "message": "Webhook endpoint is healthy"
}
```

---

## Locations

All location endpoints require authentication. Rate limited to prevent abuse.

### POST /locations/live

Update user's live location.

**Access:** Private (rate limited: 1 request per 10 seconds)

**Request Body:**
```json
{
  "longitude": 3.3792,
  "latitude": 6.5244,
  "accuracy": 10,
  "heading": 45,
  "speed": 5.5
}
```

**Validation:**
- `longitude`: -180 to 180 (required)
- `latitude`: -90 to 90 (required)
- `accuracy`: Positive number (optional)
- `heading`: 0-360 degrees (optional)
- `speed`: Non-negative number (optional)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Location updated successfully"
}
```

**Error Responses:**
- `429` - Rate limit exceeded (wait 10 seconds)

---

### GET /locations/user/:userId

Get user's recent location.

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "location": {
      "userId": "507f1f77bcf86cd799439011",
      "coordinates": [3.3792, 6.5244],
      "accuracy": 10,
      "timestamp": "2026-01-15T10:00:00.000Z"
    }
  }
}
```

---

### GET /locations/job/:jobId

Get all participant locations for a job.

**Access:** Private (job participants only)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "locations": [
      {
        "userId": "507f1f77bcf86cd799439011",
        "role": "OWNER",
        "coordinates": [3.3792, 6.5244],
        "timestamp": "2026-01-15T10:00:00.000Z"
      },
      {
        "userId": "507f1f77bcf86cd799439012",
        "role": "MECHANIC",
        "coordinates": [3.3800, 6.5250],
        "timestamp": "2026-01-15T10:00:30.000Z"
      }
    ]
  }
}
```

---

### GET /locations/nearby

Find nearby locations.

**Access:** Private

**Query Parameters:**
- `longitude`: User's longitude (required)
- `latitude`: User's latitude (required)
- `radius`: Search radius in meters (default: 5000)
- `type`: Filter by user type (MECHANIC, OWNER, SELLER)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "locations": [
      {
        "userId": "507f1f77bcf86cd799439011",
        "distance": 1250,
        "coordinates": [3.3792, 6.5244]
      }
    ]
  }
}
```

---

### GET /locations/stats

Get location statistics for current user.

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalUpdates": 150,
    "lastUpdate": "2026-01-15T10:00:00.000Z",
    "averageAccuracy": 12.5
  }
}
```

---

### GET /locations/can-update

Check if user can update location (rate limiting check).

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "canUpdate": true,
    "nextUpdateAt": null
  }
}
```

---

### POST /locations/distance

Calculate distance between two points.

**Access:** Private

**Request Body:**
```json
{
  "from": {
    "longitude": 3.3792,
    "latitude": 6.5244
  },
  "to": {
    "longitude": 3.3800,
    "latitude": 6.5250
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "distance": 125.5,
    "unit": "meters"
  }
}
```

---

## Chat

All chat endpoints require authentication. Rate limited to prevent spam.

### POST /chat/messages

Send a message.

**Access:** Private (job participants only, rate limited: 30 messages per minute)

**Request Body:**
```json
{
  "jobId": "507f1f77bcf86cd799439011",
  "recipientId": "507f1f77bcf86cd799439012",
  "content": "I'm on my way",
  "type": "TEXT"
}
```

**Validation:**
- `jobId`: Valid MongoDB ObjectId (required)
- `recipientId`: Valid MongoDB ObjectId (required)
- `content`: Max 1000 characters (required)
- `type`: TEXT, IMAGE, LOCATION (default: TEXT)

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "message": {
      "_id": "507f1f77bcf86cd799439011",
      "jobId": "507f1f77bcf86cd799439012",
      "senderId": "507f1f77bcf86cd799439013",
      "recipientId": "507f1f77bcf86cd799439014",
      "content": "I'm on my way",
      "type": "TEXT",
      "isRead": false,
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `403` - Not a job participant
- `429` - Rate limit exceeded

---

### GET /chat/jobs/:jobId/messages

Get messages for a job.

**Access:** Private (job participants only)

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (1-100, default: 50)
- `before`: Get messages before this timestamp

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "senderId": {
          "_id": "507f1f77bcf86cd799439013",
          "phoneNumber": "08012345678"
        },
        "content": "I'm on my way",
        "type": "TEXT",
        "isRead": true,
        "createdAt": "2026-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 25
    }
  }
}
```

---

### PUT /chat/messages/:messageId/read

Mark a message as read.

**Access:** Private (message recipient only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Message marked as read"
}
```

---

### PUT /chat/jobs/:jobId/read

Mark all messages in a job as read.

**Access:** Private (job participants only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "All messages marked as read",
  "data": {
    "markedCount": 5
  }
}
```

---

### GET /chat/unread-count

Get unread message count.

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "unreadCount": 3
  }
}
```

---

### GET /chat/unread

Get unread messages.

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "jobId": "507f1f77bcf86cd799439012",
        "senderId": {
          "_id": "507f1f77bcf86cd799439013",
          "phoneNumber": "08012345678"
        },
        "content": "Are you available?",
        "createdAt": "2026-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

---

### DELETE /chat/messages/:messageId

Delete a message.

**Access:** Private (message sender only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

---

## Notifications

All notification endpoints require authentication.

### POST /notifications/send

Send manual notification (Admin only).

**Access:** Private (ADMIN role required)

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "title": "System Maintenance",
  "body": "Platform will be down for maintenance",
  "data": {
    "type": "SYSTEM_ALERT"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Notification sent successfully"
}
```

---

### GET /notifications/history

Get user notification history.

**Access:** Private

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (1-100, default: 20)
- `status`: Filter by status (SENT, DELIVERED, FAILED)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Job Accepted",
        "body": "Your job has been accepted by a mechanic",
        "isRead": false,
        "createdAt": "2026-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50
    }
  }
}
```

---

### PUT /notifications/:id/read

Mark notification as read.

**Access:** Private (notification owner only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### PUT /notifications/:id/clicked

Mark notification as clicked.

**Access:** Private (notification owner only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as clicked"
}
```

---

### PUT /notifications/:id/dismissed

Mark notification as dismissed.

**Access:** Private (notification owner only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as dismissed"
}
```

---

## Spare Parts

### GET /spareparts/categories

Get available spare part categories.

**Access:** Public

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      "Engine Parts",
      "Brake System",
      "Electrical",
      "Suspension",
      "Transmission",
      "Body Parts"
    ]
  }
}
```

---

### GET /spareparts

Search spare parts near a location.

**Access:** Public (optional authentication for personalization)

**Query Parameters:**
- `lat`: Latitude (required, -90 to 90)
- `lng`: Longitude (required, -180 to 180)
- `radius`: Search radius in meters (1000-50000, default: 10000)
- `q`: Search query (optional, max 100 chars)
- `category`: Filter by category (optional)
- `minPrice`: Minimum price in kobo (optional)
- `maxPrice`: Maximum price in kobo (optional)
- `sort`: Sort by (distance, price, availability, relevance - default: distance)
- `page`: Page number (default: 1)
- `limit`: Items per page (1-100, default: 20)

**Example:** `GET /spareparts?lat=6.5244&lng=3.3792&radius=5000&q=brake&sort=price`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "parts": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Brake Pads - Toyota Camry",
        "description": "High quality brake pads",
        "price": 15000,
        "category": "Brake System",
        "seller": {
          "_id": "507f1f77bcf86cd799439012",
          "phoneNumber": "08012345678"
        },
        "location": {
          "coordinates": [3.3792, 6.5244],
          "address": "123 Ikeja Way, Lagos"
        },
        "distance": 1250,
        "inStock": true,
        "quantity": 5
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45
    }
  }
}
```

---

### GET /spareparts/:id

Get detailed spare part information.

**Access:** Public (optional authentication for personalization)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "part": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Brake Pads - Toyota Camry",
      "description": "High quality brake pads for Toyota Camry 2010-2020",
      "price": 15000,
      "category": "Brake System",
      "seller": {
        "_id": "507f1f77bcf86cd799439012",
        "phoneNumber": "08012345678",
        "businessName": "Auto Parts Store"
      },
      "location": {
        "coordinates": [3.3792, 6.5244],
        "address": "123 Ikeja Way, Lagos"
      },
      "images": ["https://example.com/image1.jpg"],
      "inStock": true,
      "quantity": 5,
      "specifications": {
        "brand": "Bosch",
        "partNumber": "BP1234"
      }
    }
  }
}
```

**Error Responses:**
- `404` - Spare part not found

---

## Orders

All order endpoints require authentication.

### POST /orders

Create a new order request.

**Access:** Private (authenticated users)

**Request Body:**
```json
{
  "items": [
    {
      "partId": "507f1f77bcf86cd799439011",
      "quantity": 2
    }
  ],
  "deliveryAddress": "123 Ikeja Way, Lagos",
  "deliveryLocation": {
    "type": "Point",
    "coordinates": [3.3792, 6.5244]
  },
  "jobId": "507f1f77bcf86cd799439012",
  "notes": "Please deliver before 5pm"
}
```

**Validation:**
- `items`: Array with at least 1 item (required)
  - `partId`: Valid MongoDB ObjectId (required)
  - `quantity`: Integer >= 1 (required)
- `deliveryAddress`: Max 500 characters (optional)
- `deliveryLocation`: GeoJSON Point (optional)
- `jobId`: Valid MongoDB ObjectId (optional)
- `notes`: Max 1000 characters (optional)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439011",
      "ownerId": "507f1f77bcf86cd799439012",
      "sellerId": "507f1f77bcf86cd799439013",
      "items": [
        {
          "partId": "507f1f77bcf86cd799439014",
          "title": "Brake Pads",
          "quantity": 2,
          "price": 15000
        }
      ],
      "totalAmount": 30000,
      "status": "PENDING",
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400` - Validation error or insufficient stock
- `404` - Part not found

---

### GET /orders

List user's orders.

**Access:** Private

**Query Parameters:**
- `status`: Filter by status (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- `role`: View as owner or seller (owner, seller - default: owner)
- `page`: Page number (default: 1)
- `limit`: Items per page (1-100, default: 20)

**Example:** `GET /orders?status=PENDING&role=seller`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "ownerId": "507f1f77bcf86cd799439012",
        "sellerId": "507f1f77bcf86cd799439013",
        "items": [
          {
            "partId": "507f1f77bcf86cd799439014",
            "title": "Brake Pads",
            "quantity": 2,
            "price": 15000
          }
        ],
        "totalAmount": 30000,
        "status": "PENDING",
        "createdAt": "2026-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15
    }
  }
}
```

---

### GET /orders/:id

Get order details.

**Access:** Private (owner or seller only)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439011",
      "ownerId": {
        "_id": "507f1f77bcf86cd799439012",
        "phoneNumber": "08012345678"
      },
      "sellerId": {
        "_id": "507f1f77bcf86cd799439013",
        "phoneNumber": "08098765432"
      },
      "items": [
        {
          "partId": "507f1f77bcf86cd799439014",
          "title": "Brake Pads",
          "quantity": 2,
          "price": 15000
        }
      ],
      "totalAmount": 30000,
      "status": "CONFIRMED",
      "deliveryAddress": "123 Ikeja Way, Lagos",
      "timestamps": {
        "confirmed": "2026-01-15T10:05:00.000Z"
      },
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `404` - Order not found
- `403` - Forbidden (not order participant)

---

### PUT /orders/:id/accept

Accept an order (seller action).

**Access:** Private (seller only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order accepted successfully",
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439011",
      "status": "CONFIRMED",
      "timestamps": {
        "confirmed": "2026-01-15T10:05:00.000Z"
      }
    }
  }
}
```

**Error Responses:**
- `400` - Order not in PENDING state
- `403` - Not the seller
- `404` - Order not found

---

### PUT /orders/:id/decline

Decline an order (seller action).

**Access:** Private (seller only)

**Request Body:**
```json
{
  "reason": "Out of stock"
}
```

**Validation:**
- `reason`: 3-500 characters (optional)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order declined successfully"
}
```

---

### PUT /orders/:id/cancel

Cancel an order (owner action).

**Access:** Private (owner only)

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

**Validation:**
- `reason`: 3-500 characters (optional)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439011",
      "status": "CANCELLED",
      "cancellationReason": "Changed my mind"
    }
  }
}
```

**Error Responses:**
- `400` - Cannot cancel delivered or already cancelled orders
- `403` - Not the owner
- `404` - Order not found

---

## Admin

All admin endpoints require authentication and ADMIN role.

### GET /admin/escrows/pending

Get pending escrow releases.

**Access:** Private (ADMIN role required)

**Query Parameters:**
- `minAmount`: Minimum amount in kobo (optional)
- `maxAmount`: Maximum amount in kobo (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (1-100, default: 20)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "escrows": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "jobId": {
          "_id": "507f1f77bcf86cd799439012",
          "description": "Car won't start"
        },
        "ownerId": {
          "_id": "507f1f77bcf86cd799439013",
          "phoneNumber": "08012345678"
        },
        "mechanicId": {
          "_id": "507f1f77bcf86cd799439014",
          "phoneNumber": "08098765432"
        },
        "amount": 5500,
        "status": "HELD",
        "heldAt": "2026-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5
    }
  }
}
```

---

### GET /admin/escrows/:id

Get escrow details.

**Access:** Private (ADMIN role required)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "escrow": {
      "_id": "507f1f77bcf86cd799439011",
      "jobId": "507f1f77bcf86cd799439012",
      "ownerId": "507f1f77bcf86cd799439013",
      "mechanicId": "507f1f77bcf86cd799439014",
      "amount": 5500,
      "platformFee": 275,
      "mechanicAmount": 5225,
      "status": "HELD",
      "statusHistory": [
        {
          "status": "PENDING",
          "changedAt": "2026-01-15T09:00:00.000Z"
        },
        {
          "status": "HELD",
          "changedAt": "2026-01-15T10:00:00.000Z"
        }
      ]
    }
  }
}
```

---

### POST /admin/escrows/:id/release

Approve escrow release.

**Access:** Private (ADMIN role required)

**Request Body:**
```json
{
  "notes": "Job completed successfully, releasing funds"
}
```

**Validation:**
- `notes`: Max 500 characters (optional)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Escrow released successfully",
  "data": {
    "escrow": {
      "_id": "507f1f77bcf86cd799439011",
      "status": "RELEASED",
      "releasedAt": "2026-01-15T11:00:00.000Z",
      "adminApprovedBy": "507f1f77bcf86cd799439015"
    }
  }
}
```

**Error Responses:**
- `400` - Escrow not in HELD status
- `404` - Escrow not found

---

### GET /admin/verifications/pending

Get pending verifications.

**Access:** Private (ADMIN role required)

**Query Parameters:**
- `type`: Filter by type (mechanic, seller)
- `page`: Page number (default: 1)
- `limit`: Items per page (1-100, default: 20)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "verifications": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "phoneNumber": "08012345678",
        "roles": ["MECHANIC"],
        "verificationStatus": "PENDING",
        "profile": {
          "fullName": "John Doe",
          "businessName": "John's Auto Repair",
          "yearsOfExperience": 5
        },
        "createdAt": "2026-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 8
    }
  }
}
```

---

### POST /admin/verifications/:id/approve

Approve verification.

**Access:** Private (ADMIN role required)

**Request Body:**
```json
{
  "type": "mechanic",
  "notes": "All documents verified"
}
```

**Validation:**
- `type`: "mechanic" or "seller" (required)
- `notes`: Max 500 characters (optional)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Verification approved successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "verificationStatus": "VERIFIED",
      "verifiedAt": "2026-01-15T11:00:00.000Z"
    }
  }
}
```

---

### POST /admin/verifications/:id/reject

Reject verification.

**Access:** Private (ADMIN role required)

**Request Body:**
```json
{
  "type": "mechanic",
  "reason": "Incomplete documentation"
}
```

**Validation:**
- `type`: "mechanic" or "seller" (required)
- `reason`: 10-500 characters (required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Verification rejected",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "verificationStatus": "REJECTED",
      "verificationRejectionReason": "Incomplete documentation"
    }
  }
}
```

---

### GET /admin/users/:id

Get user details.

**Access:** Private (ADMIN role required)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "phoneNumber": "08012345678",
      "roles": ["OWNER", "MECHANIC"],
      "isActive": true,
      "verificationStatus": "VERIFIED",
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  }
}
```

---

### POST /admin/users/:id/deactivate

Deactivate user account.

**Access:** Private (ADMIN role required)

**Request Body:**
```json
{
  "reason": "Violation of terms of service"
}
```

**Validation:**
- `reason`: 10-500 characters (required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "isActive": false,
      "deactivatedAt": "2026-01-15T11:00:00.000Z",
      "deactivationReason": "Violation of terms of service"
    }
  }
}
```

---

### POST /admin/users/:id/reactivate

Reactivate user account.

**Access:** Private (ADMIN role required)

**Request Body:**
```json
{
  "reason": "Issue resolved, reinstating account"
}
```

**Validation:**
- `reason`: 10-500 characters (required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "User reactivated successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "isActive": true,
      "reactivatedAt": "2026-01-15T11:00:00.000Z",
      "reactivationReason": "Issue resolved, reinstating account"
    }
  }
}
```

---

### GET /admin/audit-logs

Get audit logs with filters.

**Access:** Private (ADMIN role required)

**Query Parameters:**
- `action`: Filter by action (ESCROW_RELEASE, USER_DEACTIVATE, USER_REACTIVATE, VERIFICATION_APPROVE, VERIFICATION_REJECT)
- `adminId`: Filter by admin user ID
- `startDate`: ISO date string (optional)
- `endDate`: ISO date string (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (1-100, default: 50)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "action": "ESCROW_RELEASE",
        "adminId": {
          "_id": "507f1f77bcf86cd799439012",
          "phoneNumber": "08012345678"
        },
        "targetId": "507f1f77bcf86cd799439013",
        "targetType": "Escrow",
        "details": {
          "amount": 5500,
          "notes": "Job completed successfully"
        },
        "createdAt": "2026-01-15T11:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 120
    }
  }
}
```

---

### GET /admin/audit-logs/:id

Get audit log details.

**Access:** Private (ADMIN role required)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "log": {
      "_id": "507f1f77bcf86cd799439011",
      "action": "ESCROW_RELEASE",
      "adminId": {
        "_id": "507f1f77bcf86cd799439012",
        "phoneNumber": "08012345678"
      },
      "targetId": "507f1f77bcf86cd799439013",
      "targetType": "Escrow",
      "details": {
        "amount": 5500,
        "notes": "Job completed successfully"
      },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2026-01-15T11:00:00.000Z"
    }
  }
}
```

---

### GET /admin/dashboard/stats

Get dashboard statistics.

**Access:** Private (ADMIN role required)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "pendingEscrows": {
        "count": 5,
        "totalAmount": 27500
      },
      "pendingVerifications": {
        "mechanics": 3,
        "sellers": 2
      },
      "activeUsers": {
        "total": 1250,
        "owners": 800,
        "mechanics": 350,
        "sellers": 100
      },
      "recentActivity": {
        "jobsToday": 45,
        "ordersToday": 12,
        "transactionsToday": 78
      }
    }
  }
}
```

---

## Error Responses

All endpoints follow a consistent error response format:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "phoneNumber",
      "message": "Invalid Nigerian phone number format"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**429 Too Many Requests:**
```json
{
  "success": false,
  "message": "Rate limit exceeded. Please try again later."
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "An unexpected error occurred"
}
```

---

## Data Models

### User

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "phoneNumber": "08012345678",
  "roles": ["OWNER", "MECHANIC"],
  "isActive": true,
  "verificationStatus": "VERIFIED",
  "verifiedBy": "507f1f77bcf86cd799439012",
  "verifiedAt": "2026-01-15T10:00:00.000Z",
  "createdAt": "2026-01-15T09:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z"
}
```

**Roles:** OWNER, MECHANIC, SELLER, ADMIN  
**Verification Status:** PENDING, VERIFIED, REJECTED

---

### Job

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "ownerId": "507f1f77bcf86cd799439012",
  "origin": {
    "type": "Point",
    "coordinates": [3.3792, 6.5244],
    "address": "123 Ikeja Way, Lagos"
  },
  "description": "Car won't start, battery seems dead",
  "photos": ["https://example.com/photo1.jpg"],
  "state": "ACCEPTED",
  "acceptedBy": "507f1f77bcf86cd799439013",
  "priceEstimate": 5000,
  "finalPrice": 5500,
  "escrowId": "507f1f77bcf86cd799439014",
  "escrowStatus": "HELD",
  "timestamps": {
    "created": "2026-01-15T10:00:00.000Z",
    "accepted": "2026-01-15T10:05:00.000Z"
  },
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T10:05:00.000Z"
}
```

**Job States:** CREATED, MATCHING, OFFERED, ACCEPTED, EN_ROUTE, ARRIVED, IN_PROGRESS, COMPLETED, ESCROW_PENDING, CLOSED, CANCELLED  
**Escrow Status:** PENDING, HELD, RELEASED, REFUNDED, DISPUTED

---

### Mechanic Profile

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "fullName": "John Doe",
  "businessName": "John's Auto Repair",
  "specializations": ["Engine", "Electrical"],
  "yearsOfExperience": 5,
  "isAvailable": true,
  "isOnline": true,
  "rating": 4.5,
  "totalJobs": 120,
  "completedJobs": 115,
  "location": {
    "type": "Point",
    "coordinates": [3.3792, 6.5244]
  },
  "createdAt": "2026-01-15T09:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z"
}
```

---

### Wallet

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "balance": 50000,
  "currency": "NGN",
  "status": "ACTIVE",
  "totalDeposits": 100000,
  "totalWithdrawals": 50000,
  "createdAt": "2026-01-15T09:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z"
}
```

**Status:** ACTIVE, FROZEN, SUSPENDED

---

### Transaction

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "type": "DEPOSIT",
  "amount": 10000,
  "currency": "NGN",
  "status": "COMPLETED",
  "description": "Wallet top-up",
  "reference": "TXN_abc123xyz",
  "balanceBefore": 40000,
  "balanceAfter": 50000,
  "metadata": {},
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z"
}
```

**Transaction Types:** DEPOSIT, WITHDRAWAL, TRANSFER, ESCROW_HOLD, ESCROW_RELEASE, ESCROW_REFUND, PLATFORM_FEE  
**Status:** PENDING, COMPLETED, FAILED, REVERSED

---

### Escrow

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "jobId": "507f1f77bcf86cd799439012",
  "ownerId": "507f1f77bcf86cd799439013",
  "mechanicId": "507f1f77bcf86cd799439014",
  "amount": 5500,
  "currency": "NGN",
  "status": "HELD",
  "paymentMethod": "WALLET",
  "platformFee": 275,
  "mechanicAmount": 5225,
  "heldAt": "2026-01-15T10:00:00.000Z",
  "adminApprovedBy": null,
  "statusHistory": [
    {
      "status": "PENDING",
      "changedAt": "2026-01-15T09:55:00.000Z"
    },
    {
      "status": "HELD",
      "changedAt": "2026-01-15T10:00:00.000Z"
    }
  ],
  "createdAt": "2026-01-15T09:55:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z"
}
```

**Status:** PENDING, HELD, RELEASED, REFUNDED, DISPUTED, FAILED  
**Payment Methods:** WALLET, PAYSTACK

---

### Spare Part

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "sellerId": "507f1f77bcf86cd799439012",
  "title": "Brake Pads - Toyota Camry",
  "description": "High quality brake pads for Toyota Camry 2010-2020",
  "price": 15000,
  "currency": "NGN",
  "category": "Brake System",
  "images": ["https://example.com/image1.jpg"],
  "location": {
    "type": "Point",
    "coordinates": [3.3792, 6.5244],
    "address": "123 Ikeja Way, Lagos"
  },
  "inStock": true,
  "quantity": 5,
  "specifications": {
    "brand": "Bosch",
    "partNumber": "BP1234",
    "compatibility": ["Toyota Camry 2010-2020"]
  },
  "createdAt": "2026-01-15T09:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z"
}
```

---

### Order

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "ownerId": "507f1f77bcf86cd799439012",
  "sellerId": "507f1f77bcf86cd799439013",
  "items": [
    {
      "partId": "507f1f77bcf86cd799439014",
      "title": "Brake Pads - Toyota Camry",
      "quantity": 2,
      "price": 15000
    }
  ],
  "totalAmount": 30000,
  "status": "CONFIRMED",
  "deliveryAddress": "123 Ikeja Way, Lagos",
  "deliveryLocation": {
    "type": "Point",
    "coordinates": [3.3792, 6.5244]
  },
  "jobId": "507f1f77bcf86cd799439015",
  "notes": "Please deliver before 5pm",
  "timestamps": {
    "confirmed": "2026-01-15T10:05:00.000Z"
  },
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T10:05:00.000Z"
}
```

**Order Status:** PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED

---

### Chat Message

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "jobId": "507f1f77bcf86cd799439012",
  "senderId": "507f1f77bcf86cd799439013",
  "recipientId": "507f1f77bcf86cd799439014",
  "content": "I'm on my way",
  "type": "TEXT",
  "isRead": false,
  "readAt": null,
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z"
}
```

**Message Types:** TEXT, IMAGE, LOCATION

---

### Notification

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "title": "Job Accepted",
  "body": "Your job has been accepted by a mechanic",
  "type": "JOB_ACCEPTED",
  "data": {
    "jobId": "507f1f77bcf86cd799439013",
    "mechanicId": "507f1f77bcf86cd799439014"
  },
  "isRead": false,
  "readAt": null,
  "clickedAt": null,
  "dismissedAt": null,
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z"
}
```

**Notification Types:** JOB_CREATED, JOB_ACCEPTED, JOB_COMPLETED, ORDER_CREATED, ORDER_CONFIRMED, PAYMENT_RECEIVED, SYSTEM_ALERT

---

### Audit Log

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "action": "ESCROW_RELEASE",
  "adminId": "507f1f77bcf86cd799439012",
  "targetId": "507f1f77bcf86cd799439013",
  "targetType": "Escrow",
  "details": {
    "amount": 5500,
    "notes": "Job completed successfully"
  },
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2026-01-15T11:00:00.000Z"
}
```

**Audit Actions:** ESCROW_RELEASE, USER_DEACTIVATE, USER_REACTIVATE, VERIFICATION_APPROVE, VERIFICATION_REJECT

---

## Notes

### Currency

All monetary amounts are in **kobo** (Nigerian currency subunit):
- 1 Naira (₦) = 100 kobo
- Example: ₦100.00 = 10000 kobo

### Coordinates

All geographic coordinates use **GeoJSON format**:
- Format: `[longitude, latitude]`
- Longitude range: -180 to 180
- Latitude range: -90 to 90

### Timestamps

All timestamps are in **ISO 8601 format** (UTC):
- Example: `2026-01-15T10:00:00.000Z`

### Pagination

Paginated endpoints return:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### Rate Limiting

Rate limits vary by endpoint:
- OTP requests: Limited per phone number
- Location updates: 1 per 10 seconds
- Chat messages: 30 per minute
- General API: 60-100 requests per minute

---

**End of Documentation**
