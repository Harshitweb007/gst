output "app_url" {
  description = "Public URL of the deployed application"
  value       = "http://${aws_eip.app.public_ip}"
}

output "public_ip" {
  description = "Elastic IP address"
  value       = aws_eip.app.public_ip
}

output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.app.id
}

output "ssh_command" {
  description = "SSH command (requires key_name)"
  value       = var.key_name != "" ? "ssh -i ~/.ssh/${var.key_name}.pem ec2-user@${aws_eip.app.public_ip}" : "Set key_name in terraform.tfvars to enable SSH"
}

output "deploy_log_hint" {
  description = "How to check bootstrap logs on the server"
  value       = "ssh ec2-user@${aws_eip.app.public_ip} 'sudo tail -f /var/log/invoice-deploy.log'"
}
