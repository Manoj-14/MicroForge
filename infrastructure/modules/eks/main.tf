data "aws_iam_user" "devops" {
  user_name = var.devops_username
}

locals {
  validate_user = data.aws_iam_user.devops.arn != "" ? true : file("ERROR: DevOps user ${var.devops_username} not found")
}


resource "aws_iam_role" "cluster-role" {
  name = "${var.project_name}-${var.environment}-eks-cluster-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "cluster-policy" {
  for_each = toset(var.cluster_policies)
  policy_arn = each.value
  role       = aws_iam_role.cluster-role.name
  depends_on = [ aws_iam_role.cluster-role ]
}

resource "aws_eks_cluster" "cluster" {
  name = var.cluster_name
  version = var.cluster_version
  role_arn = aws_iam_role.cluster-role.arn

  vpc_config {
    subnet_ids = var.subnet_ids
  }

  depends_on = [ aws_iam_role_policy_attachment.cluster-policy ]

  access_config {
    authentication_mode = "API"
  }

  tags = merge(var.tags,{
    name = "${var.project_name}-${var.environment}-eks-cluster"
  })
}

resource "aws_eks_access_entry" "devops_entry" {
  cluster_name = aws_eks_cluster.cluster.name
  principal_arn = data.aws_iam_user.devops.arn
  kubernetes_groups = [ "eks-admin" ]
  type = "STANDARD"
}

resource "aws_eks_access_policy_association" "eks-cluster-admin-policy-association" {
    cluster_name = aws_eks_cluster.cluster.name
    policy_arn = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
    access_scope {
      type = "cluster"
    }
    principal_arn = data.aws_iam_user.devops.arn
    depends_on = [ aws_eks_access_entry.devops_entry ]
}

resource "aws_iam_role" "node-role" {
  name = "${var.project_name}-${var.environment}-eks-node-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "node-policy" {
  for_each = toset(var.node_policies)
  policy_arn = each.value
  role       = aws_iam_role.node-role.name
  depends_on = [ aws_iam_role.node-role ]
}

resource "aws_eks_node_group" "node-group" {
  for_each = var.node_groups
  cluster_name = aws_eks_cluster.cluster.name
  node_group_name = each.key
  node_role_arn = aws_iam_role.node-role.arn
  subnet_ids = var.subnet_ids

  instance_types = each.value.instance_types
  capacity_type = each.value.capacity_type
  scaling_config {
    desired_size = each.value.scaling_config.desired_size
    max_size     = each.value.scaling_config.max_size
    min_size     = each.value.scaling_config.min_size
  }
  depends_on = [ aws_iam_role_policy_attachment.node-policy ]

  tags = merge(var.tags,{
    name = "${var.project_name}-${var.environment}-eks-node-group-${each.key}"
  })
}