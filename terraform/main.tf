module "vpc" {
  source = "./modules/vpc"

  project_name         = var.project_name
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones   = var.availability_zones
}

resource "aws_security_group" "alb" {
  name        = "saa-quiz-alb-sg"
  description = "ALB acces"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "saa-quiz-alb-sg"
  }
}

resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = module.vpc.public_subnet_ids

  tags = {
    Name = "${var.project_name}-alb"
  }
}

resource "aws_lb_target_group" "main" {
  name     = "${var.project_name}-tg"
  port     = 8000
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id

  health_check {
    path                = "/health"
    healthy_threshold   = 5
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }

  tags = {
    Name = "${var.project_name}-tg"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-Res-PQ-2025-09"
  certificate_arn   = "arn:aws:acm:ap-northeast-2:299149745641:certificate/05824cf3-c815-4830-b05f-8dc9998474dd"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }
}

module "ec2" {
  source = "./modules/ec2"

  project_name           = var.project_name
  vpc_id                 = module.vpc.vpc_id
  alb_security_group_id  = aws_security_group.alb.id
  private_subnet_ids     = module.vpc.private_subnet_ids
  ami_id                 = var.ami_id
  instance_type          = var.instance_type
  key_name               = var.key_name
}

resource "aws_lb_target_group_attachment" "was" {
  count = 2

  target_group_arn = aws_lb_target_group.main.arn
  target_id        = module.ec2.instance_ids[count.index]
  port             = 8000
}

module "rds" {
  source = "./modules/rds"

  project_name          = var.project_name
  vpc_id                = module.vpc.vpc_id
  ec2_security_group_id = module.ec2.security_group_id
  private_subnet_ids    = module.vpc.private_subnet_ids

  engine_version          = var.db_engine_version
  instance_class          = var.db_instance_class
  allocated_storage       = var.db_allocated_storage
  db_name                 = var.db_name
  db_username             = var.db_username
  db_password             = var.db_password
  multi_az                = var.db_multi_az
  backup_retention_period = var.db_backup_retention_period
  backup_window           = var.db_backup_window
  maintenance_window      = var.db_maintenance_window
}

module "s3" {
  source = "./modules/s3"

  project_name = var.project_name
}

module "route53" {
  source = "./modules/route53"

  domain_name            = var.domain_name
  cloudfront_domain_name = "d2g2ghqsw6fiia.cloudfront.net"
}

module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
}