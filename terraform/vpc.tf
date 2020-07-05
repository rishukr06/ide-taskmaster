resource "google_compute_network" "vpc" {
  name                    = "ide-worker-vpc"
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"
}

resource "google_compute_firewall" "deny-all-ingress" {
  name    = "ide-worker-deny-ingress"
  network = google_compute_network.vpc.name

  deny {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

  deny {
    protocol = "udp"
    ports    = ["0-65535"]
  }

  deny {
    protocol = "icmp"
  }

  priority = 1000

  target_tags = ["ide-worker"]
}

resource "google_compute_firewall" "allow-healthcheck-ingress" {
  name    = "ide-worker-healthcheck-ingress"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["3001"]
  }

  priority = 900

  target_tags = ["ide-worker"]
}

resource "google_compute_subnetwork" "private_subnet" {
  ip_cidr_range    = var.private_subnet_cidr
  name             = "ide-worker-${var.region}-private-subnet"
  network          = google_compute_network.vpc.self_link
  region           = var.region
  enable_flow_logs = true
}
