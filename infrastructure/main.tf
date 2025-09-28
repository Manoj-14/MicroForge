module "vpc" {
  source               = "./modules/vpc"
  project_name         = var.project_name
  environment          = terraform.workspace
  vpc_cidr             = lookup(var.vpc_cidr, terraform.workspace)
  availability_zones   = var.availability_zones[var.aws_region]
  public_subnet_cidrs  = lookup(var.public_subnet_cidrs, terraform.workspace)
  private_subnet_cidrs = lookup(var.private_subnet_cidrs, terraform.workspace)
  tags                 = { "project-name" : var.project_name, "environment" : terraform.workspace }
}

module "eks" {
  source             = "./modules/eks"
  region             = var.aws_region
  project_name       = var.project_name
  environment        = terraform.workspace
  cluster_name       = var.cluster_name
  cluster_version    = var.cluster_version
  cluster_policies   = var.cluster_policys
  node_policies      = var.node_policies
  devops_username    = var.devops_username
  developer_username = var.developer_username
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnet_ids
  node_groups        = lookup(var.node_groups, terraform.workspace)
  tags               = { "project-name" : var.project_name, "environment" : terraform.workspace }
  depends_on         = [module.vpc]
}

resource "null_resource" "update-kubeconfig" {
  depends_on = [ module.eks ]
  provisioner "local-exec" {
    command = <<EOT
      aws eks update-kubeconfig --name ${module.eks.cluster_name} --region ${var.aws_region}
    EOT
  }
}