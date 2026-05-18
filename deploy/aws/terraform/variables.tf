variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Resource name prefix"
  type        = string
  default     = "invoice-generator"
}

variable "instance_type" {
  description = "EC2 instance type (t3.medium recommended)"
  type        = string
  default     = "t3.medium"
}

variable "key_name" {
  description = "Optional EC2 key pair name for SSH"
  type        = string
  default     = ""
}

variable "allowed_ssh_cidr" {
  description = "CIDR allowed to SSH (port 22). Use your public IP/32"
  type        = string
  default     = "0.0.0.0/0"
}

variable "git_repo_url" {
  description = "Git repo cloned on the EC2 instance"
  type        = string
  default     = "https://github.com/Harshitweb007/gst.git"
}

variable "git_branch" {
  description = "Git branch to deploy"
  type        = string
  default     = "main"
}

variable "jwt_secret" {
  description = "JWT secret for the backend"
  type        = string
  sensitive   = true
}

variable "razorpay_key_id" {
  description = "Razorpay key ID"
  type        = string
  sensitive   = true
}

variable "razorpay_key_secret" {
  description = "Razorpay key secret"
  type        = string
  sensitive   = true
}
