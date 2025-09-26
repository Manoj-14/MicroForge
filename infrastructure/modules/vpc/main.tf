resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  instance_tenancy     = "default"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = merge(var.tags, {
    name = "${var.project_name}-${var.environment}-vpc"
  })
}

resource "aws_subnet" "public-subnet" {
  vpc_id                  = aws_vpc.main.id
  count                   = length(var.public_subnet_cidrs)
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true
  tags = merge(var.tags, {
    name = "${var.project_name}-${var.environment}-public-subnet-${count.index + 1}"
  })
}

resource "aws_subnet" "private-subnet" {
  vpc_id            = aws_vpc.main.id
  count             = length(var.private_subnet_cidrs)
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]
  tags = merge(var.tags, {
    name : "${var.project_name}-${var.environment}-private-subnet-${count.index}"
  })
}

resource "aws_internet_gateway" "internet-gateway" {
  vpc_id = aws_vpc.main.id
  tags = merge(var.tags, {
    name = "${var.project_name}-${var.environment}-igw"
  })
}

resource "aws_eip" "elastic-ip" {
  count  = length(var.public_subnet_cidrs)
  domain = "vpc"
  tags = merge(var.tags, {
    name = "${var.project_name}-${var.environment}-eip-${count.index + 1}"
  })
}

resource "aws_nat_gateway" "nat-gateway" {
  count         = length(var.public_subnet_cidrs)
  allocation_id = aws_eip.elastic-ip[count.index].id
  subnet_id     = aws_subnet.public-subnet[count.index].id
  depends_on    = [aws_eip.elastic-ip]
  tags = merge(var.tags, {
    name = "${var.project_name}-${var.environment}-nat-gateway-${count.index + 1}"
  })
}

resource "aws_route_table" "public-route-table" {
  vpc_id = aws_vpc.main.id
  depends_on = [aws_internet_gateway.internet-gateway]
  tags = merge(var.tags, {
    name = "${var.project_name}-${var.environment}-public-rt"
  })
}

resource "aws_route" "public-internet-access" {
  route_table_id = aws_route_table.public-route-table.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id = aws_internet_gateway.internet-gateway.id
  depends_on = [aws_internet_gateway.internet-gateway, aws_route_table.public-route-table]
}

resource "aws_route_table" "private-route-table" {
  vpc_id     = aws_vpc.main.id
  count      = length(var.private_subnet_cidrs)
  depends_on = [aws_nat_gateway.nat-gateway]
  tags = merge(var.tags, {
    name = "${var.project_name}-${var.environment}-private-rt-${count.index + 1}"
  })
}

resource "aws_route" "private-internet-access" {
  count = length(var.private_subnet_cidrs)
  route_table_id         = aws_route_table.private-route-table[count.index].id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id = aws_nat_gateway.nat-gateway[count.index].id
  depends_on = [aws_nat_gateway.nat-gateway, aws_route_table.private-route-table]
}

resource "aws_route_table_association" "public-route-table-association" {
  count          = length(var.public_subnet_cidrs)
  subnet_id      = aws_subnet.public-subnet[count.index].id
  route_table_id = aws_route_table.public-route-table.id
  depends_on     = [aws_route_table.public-route-table]
}

resource "aws_route_table_association" "private-route-table-association" {
  count          = length(var.private_subnet_cidrs)
  subnet_id      = aws_subnet.private-subnet[count.index].id
  route_table_id = aws_route_table.private-route-table[count.index].id
  depends_on     = [aws_route_table.private-route-table]
}
