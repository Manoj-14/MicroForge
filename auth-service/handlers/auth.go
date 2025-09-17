package handlers

import (
	"auth-service/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type ValidateTokenRequest struct {
	Token string `json:"token" binding:"required"`
}

type ValidateTokenResponse struct {
	Valid    bool   `json:"valid"`
	Username string `json:"username,omitempty"`
	Message  string `json:"message,omitempty"`
}

// HealthCheck returns the health status of the service
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "healthy",
		"service":   "auth-service",
		"version":   "1.0.0",
		"timestamp": utils.GetCurrentTimestamp(),
	})
}

// ValidateToken validates a JWT token
func ValidateToken(c *gin.Context) {
	var request ValidateTokenRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, ValidateTokenResponse{
			Valid:   false,
			Message: "Invalid request format",
		})
		return
	}

	// Clean token (remove "Bearer " prefix if present)
	token := strings.TrimPrefix(request.Token, "Bearer ")

	username, err := utils.ValidateJWT(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, ValidateTokenResponse{
			Valid:   false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, ValidateTokenResponse{
		Valid:    true,
		Username: username,
		Message:  "Token is valid",
	})
}

// VerifyToken verifies a JWT token from URL parameter
func VerifyToken(c *gin.Context) {
	token := c.Param("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"valid":   false,
			"message": "Token parameter is required",
		})
		return
	}

	username, err := utils.ValidateJWT(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"valid":   false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"valid":    true,
		"username": username,
		"message":  "Token is valid",
	})
}

// GetProfile returns user profile from JWT token
func GetProfile(c *gin.Context) {
	// Get user info from context (set by JWT middleware)
	username, exists := c.Get("username")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "User not found in token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"username":  username,
		"message":   "Profile retrieved successfully",
		"timestamp": utils.GetCurrentTimestamp(),
	})
}

// TestProtected is a test endpoint for protected routes
func TestProtected(c *gin.Context) {
	username, _ := c.Get("username")

	c.JSON(http.StatusOK, gin.H{
		"message":   "This is a protected endpoint",
		"user":      username,
		"timestamp": utils.GetCurrentTimestamp(),
		"data": map[string]interface{}{
			"secret_info": "This data is only available to authenticated users",
			"permissions": []string{"read", "write"},
		},
	})
}
