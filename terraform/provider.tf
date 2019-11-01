provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

provider "template" {
  version = "~> 2.1"
}
