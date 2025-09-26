variable "project_name" {
  description = "value for the project name tag"
  type = string
}

variable "environment" {
  description = "value for the environment tag"
  type = string
}
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
}

variable "availability_zones" {
  description = "List of availability zones to use"
  type        = list(string)
}

variable "public_subnet_cidrs" {
  description = "List of CIDR blocks for public subnets"
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "List of CIDR blocks for private subnets"
  type        = list(string)
}

variable "tags" {
  description = "value for the tags"
  type        = map(string)
}