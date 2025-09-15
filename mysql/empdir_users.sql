--
-- Table structure for table `users`
--

CREATE DATABASE IF NOT EXISTS empdir;
USE empdir;

CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UK_r43af9ap4edm43mmtq01oddj6` (`username`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `users` WRITE;

INSERT INTO `users` VALUES (2,'2025-09-02 19:01:17.474933','manoj@gmail.com','Manoj',_binary '','M','$2a$10$U4.TiSE5tsoosTOYxCLBeuDMH9HynU0DfdoZzBzb/4NZBBhiSvhRy','2025-09-02 19:01:17.474933','manojm'),(3,'2025-09-02 20:10:10.747614','manumadhu1425@gmail.com','Manoj',_binary '','M','$2a$10$Xb5RqL3DGgHd3CaWjB7M3.Hst1lYFDlqn2qqWildgtvnAz9W0PraW','2025-09-02 20:10:10.747614','manoj14');

UNLOCK TABLES;











