terraform {
  backend "s3" {
    key          = "terraform.tfstate"
    region       = "ap-south-1"
    encrypt      = true
    use_lockfile = true
    # dynamodb_table = "microforge-infra-state-lock"
  }
}