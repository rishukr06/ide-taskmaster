provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
  version = "~> 2.18"
}

provider "template" {
  version = "~> 2.1"
}
