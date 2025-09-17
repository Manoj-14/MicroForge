package models

import "github.com/golang-jwt/jwt/v5"

// JWTClaims represents the structure of JWT claims
type JWTClaims struct {
	Username string `json:"username"`
	Email    string `json:"email,omitempty"`
	Role     string `json:"role,omitempty"`
	jwt.RegisteredClaims
}

// User represents a user in the system
type User struct {
	ID        int    `json:"id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}

// AuthResponse represents the response for authentication operations
type AuthResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Token   string      `json:"token,omitempty"`
}
