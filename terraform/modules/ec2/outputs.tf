output "instance_ids" {
  description = "EC2 instance IDs"
  value       = aws_instance.was[*].id
}

output "security_group_id" {
  description = "EC2 security group ID"
  value       = aws_security_group.ec2.id
}

output "iam_role_name" {
  description = "IAM role name"
  value       = aws_iam_role.ec2.name
}

output "instance_profile_name" {
  description = "IAM instance profile name"
  value       = aws_iam_instance_profile.ec2.name
}
