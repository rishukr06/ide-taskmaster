variable "project_id" {
  default = "ctfhubio"
}

variable "region" {
  default = "asia-south1"
}

variable "zone" {
  default = "asia-south1-c"
}

variable "zone_2" {
  default = "asia-south1-b"
}

variable "private_subnet_cidr" {
  default = "10.11.11.0/24"
}

variable "machine_type" {
  default = "n1-standard-1"
}

variable "instance_service_account" {
  default = "ide-worker@ctfhubio.iam.gserviceaccount.com"
}

variable "min_replica" {
  default = 1
}

variable "max_replica" {
  default = 5
}

variable "cool_down_period" {
  default = 300
}

variable "max_unavailable_fixed" {
  default = 0
}

variable "max_surge_fixed" {
  default = 1
}

variable "ide_tasks_name" {
  default = "projects/ctfhubio/topics/ide-tasks"
}

variable "ide_tasks_subscription" {
  default = "ide-taskmaster-subscription"
}

variable "ide_task_results_topic" {
  default = "projects/ctfhubio/topics/ide-task-results"
}

variable "worker_docker_image_name" {
  default = "ifaisalalam/ide-taskmaster"
}

variable "app_env" {
  default = "production"
}

variable "single_instance_max_task" {
  default = 10
}
