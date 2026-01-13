package main

import (
	"auth-service/handlers"
	"auth-service/metrics"
	"auth-service/middleware"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/prometheus/client_golang/prometheus/promhttp"
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

	// Initialize Prometheus metrics (MUST be before middleware usage)
	metrics.Init()

	// Prometheus metrics middleware (counts all requests)
	router.Use(middleware.MetricsMiddleware())

	// Add CORS middleware
	router.Use(middleware.CORSMiddleware())

	// 🔍 Register Prometheus metrics endpoint (NO auth)
	log.Println("Registering /metrics endpoint")
	router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// Health check endpoint
	router.GET("/api/auth/health", handlers.HealthCheck)

	// Auth routes
	authRoutes := router.Group("/api/auth")
	{
		authRoutes.POST("/validate", handlers.ValidateToken)
		authRoutes.GET("/verify/:token", handlers.VerifyToken)
	}

	// Protected routes (require valid JWT)
	protectedRoutes := router.Group("/api/auth/protected")
	protectedRoutes.Use(middleware.JWTMiddleware())
	{
		protectedRoutes.GET("/profile", handlers.GetProfile)
		protectedRoutes.GET("/test", handlers.TestProtected)
	}

	// Start server
	port := os.Getenv("AUTH_SERVICE_PORT")
	if port == "" {
		log.Fatal("AUTH_SERVICE_PORT not set in environment")
		os.Exit(0)
	}

	log.Printf("Auth Service starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
