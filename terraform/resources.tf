data "google_compute_image" "vm_image" {
  family  = "centos-7"
  project = "centos-cloud"
}

resource "google_compute_instance_template" "ide_worker" {
  name        = "ide-worker-template"
  description = "This template is used to create IDE worker instances which handles execution of user-submitted code."

  tags = ["ide-worker"]

  labels = {
    service = "ide"
    class   = "worker"
  }

  machine_type = var.machine_type

  disk {
    source_image = data.google_compute_image.vm_image.self_link
    auto_delete  = true
    boot         = true
  }

  scheduling {
    automatic_restart   = true
    on_host_maintenance = "MIGRATE"
  }

  network_interface {
    subnetwork = google_compute_subnetwork.private_subnet.name
    access_config {}
  }

  service_account {
    email = var.instance_service_account
    // The best practice is to set the full "cloud-platform" access scope on the instance,
    // then securely limit your service account's access by granting IAM roles to the service account.
    scopes = ["cloud-platform"]
  }

  metadata_startup_script = <<SCRIPT
  #!/bin/bash

  apt-get -y update
  curl https://get.docker.com | sh
  systemctl start docker
  mkdir -p /tmp/box
  docker run \
  --detach \
  --mount 'type=bind,src=/var/run/docker.sock,dst=/var/run/docker.sock' \
  --mount 'type=bind,src=/tmp/box,dst=/tmp/box' \
  --env PUBSUB_IDE_TOPIC=${var.ide_tasks_name} \
  --env PUBSUB_IDE_SUBSCRIPTION=${var.ide_tasks_subscription} \
  --env PUBSUB_IDE_OUTPUT_TOPIC=${var.ide_task_results_topic} \
  --env MAX_CONCURRENT_JOBS=${var.single_instance_max_task} \
  --env NODE_ENV=${var.app_env} \
  --restart always \
  ${var.worker_docker_image_name}
  SCRIPT
}

resource "google_compute_instance_group_manager" "ide_taskmaster_instance_group" {
  provider = "google-beta"
  project  = var.project_id

  name               = "ide-taskmaster"
  base_instance_name = "ide-taskmaster"
  zone               = var.zone
  target_size        = var.min_replica

  version {
    name              = "ide-taskmaster"
    instance_template = google_compute_instance_template.ide_worker.self_link
  }

  update_policy {
    minimal_action        = "REPLACE"
    type                  = "PROACTIVE"
    min_ready_sec         = var.cool_down_period
    max_unavailable_fixed = var.max_unavailable_fixed
    max_surge_fixed       = var.max_surge_fixed
  }
}

resource "google_compute_autoscaler" "ide_taskmaster_autoscaler" {
  provider = "google-beta"
  project  = var.project_id

  name   = "ide-taskmaster-autoscaler"
  zone   = var.zone
  target = google_compute_instance_group_manager.ide_taskmaster_instance_group.self_link

  autoscaling_policy {
    max_replicas    = var.max_replica
    min_replicas    = var.min_replica
    cooldown_period = var.cool_down_period

    metric {
      name                       = "pubsub.googleapis.com/subscription/num_undelivered_messages"
      filter                     = "resource.type = pubsub_subscription AND resource.label.subscription_id = ${var.ide_tasks_subscription}"
      single_instance_assignment = var.single_instance_max_task
    }
  }
}
