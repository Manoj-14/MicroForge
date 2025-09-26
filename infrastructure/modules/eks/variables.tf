variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}
variable "cluster_version" {
  description = "Version of the EKS cluster"
  type        = string
}
variable "project_name" {
  description = "value for the project name tag"
  type = string 
}
variable "environment" {
  description = "value for the environment tag"
  type = string
}
variable "region" {
  description = "AWS region to deploy resources"
  type        = string
}
variable "vpc_id" {
  description = "The VPC ID where the EKS cluster will be deployed"
  type        = string  
}
variable "subnet_ids" {
  description = "List of subnet IDs for the EKS cluster"
  type        = list(string)
}

variable "node_groups" {
  description = "Map of node group configurations"
  type        = map(object({
    instance_types   = list(string)
    capacity_type   = string
    scaling_config = object({
      desired_size = number
      max_size     = number
      min_size     = number
    })
  }))
}
variable "developer_username" {
  description = "name of the developer iam user"
  type        = string
}

variable "devops_username" {
  description = "name of the DevOps iam user"
  type        = string
}

variable "cluster_policies" {
  description = "List of IAM policies to attach to the EKS cluster role"
  type        = list(string)
}
variable "node_policies" {
  description = "List of IAM policies to attach to the EKS node role"
  type        = list(string)
}
variable "tags" {
  description = "value for the tags"
  type        = map(string)
}