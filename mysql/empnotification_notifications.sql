--
-- Table structure for table `notifications`
--

CREATE DATABASE IF NOT EXISTS empnotification;
USE empnotification;

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('success','error','warning','info') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `service` varchar(255) NOT NULL,
  `read` tinyint(1) DEFAULT '0',
  `timestamp` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `notifications` WRITE;

INSERT INTO `notifications` VALUES (1,'success','User Registration','New user manoj14 has registered successfully','login-service',1,'2025-09-02 14:40:10','2025-09-02 14:40:10','2025-09-02 15:07:29'),(2,'info','User Login','User manoj14 logged in successfully','auth-service',1,'2025-09-02 14:40:28','2025-09-02 14:40:28','2025-09-02 15:07:26'),(3,'info','User Login','User manoj14 logged in successfully','auth-service',1,'2025-09-02 14:40:28','2025-09-02 14:40:28','2025-09-02 15:07:27'),(4,'info','User Login','User manojm logged in successfully','auth-service',1,'2025-09-02 15:38:35','2025-09-02 15:38:35','2025-09-02 15:38:52'),(5,'info','User Login','User manojm logged in successfully','auth-service',1,'2025-09-02 15:38:35','2025-09-02 15:38:35','2025-09-02 15:38:53'),(6,'info','User Login','User manojm logged in successfully','auth-service',1,'2025-09-03 05:18:51','2025-09-03 05:18:51','2025-09-03 05:20:14'),(7,'info','User Login','User manojm logged in successfully','auth-service',0,'2025-09-03 05:18:51','2025-09-03 05:18:51','2025-09-03 05:18:51'),(8,'info','User Login','User manoj14 logged in successfully','auth-service',0,'2025-09-03 07:57:42','2025-09-03 07:57:42','2025-09-03 07:57:42'),(9,'info','User Login','User manoj14 logged in successfully','auth-service',0,'2025-09-03 07:57:42','2025-09-03 07:57:42','2025-09-03 07:57:42'),(10,'info','User Login','User manoj14 logged in successfully','auth-service',0,'2025-09-03 14:56:22','2025-09-03 14:56:22','2025-09-03 14:56:22'),(11,'info','User Login','User manoj14 logged in successfully','auth-service',0,'2025-09-03 14:56:22','2025-09-03 14:56:22','2025-09-03 14:56:22'),(12,'info','User Login','User manoj14 logged in successfully','auth-service',0,'2025-09-03 15:04:41','2025-09-03 15:04:41','2025-09-03 15:04:41'),(13,'info','User Login','User manoj14 logged in successfully','auth-service',0,'2025-09-03 15:04:41','2025-09-03 15:04:41','2025-09-03 15:04:41');

UNLOCK TABLES;