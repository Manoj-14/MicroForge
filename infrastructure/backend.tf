terraform {
  backend "s3" {
    bucket         = "microforge-infra-state"
    key            = "terraform.tfstate"
    region         = "ap-southeast-2"
    encrypt        = true
    use_lockfile   = true
    dynamodb_table = "microforge-infra-state-lock"
  }
}