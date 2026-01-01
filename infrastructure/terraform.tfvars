project_name = "microforge"
aws_region   = "ap-southeast-2"
vpc_cidr = {
  "stage"      = "10.0.0.0/16"
  "production" = "172.0.0.0/16"
}
availability_zones = {
  "ap-southeast-2" = ["ap-southeast-2a", "ap-southeast-2b"],
  "us-east-1"      = ["us-east-1a", "us-east-1b", "us-east-1c"]
}
public_subnet_cidrs = {
  "stage"      = ["10.0.1.0/24", "10.0.2.0/24"],
  "production" = ["172.0.1.0/24", "172.0.2.0/24"]
}
private_subnet_cidrs = {
  "stage"      = ["10.0.3.0/24", "10.0.4.0/24"],
  "production" = ["172.0.3.0/24", "172.0.4.0/24"]
}
cluster_name    = "microforge-eks-cluster"
cluster_version = "1.30"
node_groups = {
  "stage" = {
    "general" = {
      instance_types = ["c7i-flex.large"]
      capacity_type  = "ON_DEMAND"
      scaling_config = {
        desired_size = 2
        max_size     = 4
        min_size     = 1
      }
    }
  }
  "production" = {
    "general" = {
      instance_types = ["m7i-flex.large"]
      capacity_type  = "ON_DEMAND"
      scaling_config = {
        desired_size = 3
        max_size     = 6
        min_size     = 2
      }
    }
  }
}
developer_username = "manoj-m"
devops_username    = "manm-win"

cluster_policys = [
  "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy",
  "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController"
]
node_policies = [
  "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
  "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
  "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
]