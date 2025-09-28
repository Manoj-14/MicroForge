variable "project_name" {
  description = "value for the project name tag"
  type        = string
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = map(string)
}

variable "availability_zones" {
  description = "List of availability zones to use"
  type        = map(list(string))
}

variable "public_subnet_cidrs" {
  description = "List of CIDR blocks for public subnets"
  type        = map(list(string))
}

variable "private_subnet_cidrs" {
  description = "List of CIDR blocks for private subnets"
  type        = map(list(string))
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}
variable "cluster_version" {
  description = "Version of the EKS cluster"
  type        = string
}

variable "node_groups" {
  description = "Map of node group configurations"
  type = map(map(object({
    instance_types = list(string)
    capacity_type  = string
    scaling_config = object({
      desired_size = number
      max_size     = number
      min_size     = number
    })
  })))
}
variable "cluster_policys" {
  description = "List of IAM policies to attach to the EKS cluster role"
  type        = list(string)
}
variable "node_policies" {
  description = "List of IAM policies to attach to the EKS node role"
  type        = list(string)
}
variable "devops_username" {
  description = "name of the DevOps iam user"
  type        = string
}
variable "developer_username" {
  description = "name of the DevOps iam user"
  type        = string
}