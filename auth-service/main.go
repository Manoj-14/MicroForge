package main

import (
	"auth-service/handlers"
	"auth-service/middleware"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Set Gin mode
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize router
	router := gin.Default()

	// Add CORS middleware
	router.Use(middleware.CORSMiddleware())

	// Health check endpoint
	router.GET("/api/health", handlers.HealthCheck)

	// Auth routes
	authRoutes := router.Group("/api")
	{
		authRoutes.POST("/validate", handlers.ValidateToken)
		authRoutes.GET("/verify/:token", handlers.VerifyToken)
	}

	// Protected routes (require valid JWT)
	protectedRoutes := router.Group("/api/protected")
	protectedRoutes.Use(middleware.JWTMiddleware())
	{
		protectedRoutes.GET("/profile", handlers.GetProfile)
		protectedRoutes.GET("/test", handlers.TestProtected)
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("AUTH_SERVICE_PORT not set in environment")
		os.Exit(0)
	}
	log.Printf("Auth Service starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
