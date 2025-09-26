output "project_name" {
  value = var.project_name
}

output "environment" {
  value = terraform.workspace
}

output "cluster_name" {
  description = "value of the EKS cluster name"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "value of cluster endpoint "
  value       = module.eks.cluster_endpoint
}

output "vpc_id" {
  description = "value of vpc id"
  value       = module.vpc.vpc_id
}

output "public_subnet_cidrs" {
  description = "value of public subnet cidrs"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_cidrs" {
  description = "value of public subnet cidrs"
  value       = module.vpc.private_subnet_ids
}