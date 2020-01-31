data "google_compute_image" "vm_image" {
  family  = "centos-7"
  project = "centos-cloud"
}

resource "google_compute_instance_template" "ide_worker" {
  name_prefix = "ide-worker-template"
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

  lifecycle {
    create_before_destroy = true
  }

  metadata_startup_script = <<SCRIPT
  #!/bin/bash

  yum -y update
  yum install epel-release
  yum -y update
  yum -y install supervisor
  systemctl start supervisord
  systemctl enable supervisord

  curl https://get.docker.com | sh
  systemctl start docker

  curl -sL https://rpm.nodesource.com/setup_10.x | sudo bash -
  yum clean all
  yum makecache fast
  yum -y install gcc-c++ make
  yum -y install nodejs

  yum -y install git

  groupadd docker
  adduser node
  usermod -aG docker node

  mkdir -p /home/node/taskmaster
  git clone https://github.com/ifaisalalam/ide-taskmaster /home/node/taskmaster
  cd /home/node/taskmaster
  npm install
  npm run build
  rm -rf node_modules/*
  npm install --only=production

  mkdir -p /tmp/box
  chmod 777 -R /tmp/box

  iptables -A INPUT -d 172.17.0.0/16 -i docker0 -j DROP

  docker network create --internal --subnet 10.1.1.0/24 no-internet

  tee -a /etc/supervisord.conf > /dev/null <<CONF
[program:taskmaster]
command=node /home/node/taskmaster/dist/taskmaster.js
autostart=true
autorestart=true
environment=
    PUBSUB_IDE_TOPIC=${var.ide_tasks_name},
    PUBSUB_IDE_SUBSCRIPTION=${var.ide_tasks_subscription},
    PUBSUB_IDE_OUTPUT_TOPIC=${var.ide_task_results_topic},
    MAX_CONCURRENT_JOBS=${var.single_instance_max_task},
    NODE_ENV=${var.app_env}
stderr_logfile=/var/log/taskmaster.err.log
stdout_logfile=/var/log/taskmaster.out.log
user=node
CONF

  supervisorctl reread
  supervisorctl update
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

    cpu_utilization {
      target = 0.6
    }
  }
}

resource "google_compute_instance_group_manager" "ide_taskmaster_2_instance_group" {
  provider = "google-beta"
  project  = var.project_id

  name               = "ide-taskmaster-2"
  base_instance_name = "ide-taskmaster-2"
  zone               = var.zone_2
  target_size        = var.min_replica

  version {
    name              = "ide-taskmaster-2"
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

resource "google_compute_autoscaler" "ide_taskmaster_2_autoscaler" {
  provider = "google-beta"
  project  = var.project_id

  name   = "ide-taskmaster-2-autoscaler"
  zone   = var.zone_2
  target = google_compute_instance_group_manager.ide_taskmaster_2_instance_group.self_link

  autoscaling_policy {
    max_replicas    = var.max_replica
    min_replicas    = var.min_replica
    cooldown_period = var.cool_down_period

    metric {
      name                       = "pubsub.googleapis.com/subscription/num_undelivered_messages"
      filter                     = "resource.type = pubsub_subscription AND resource.label.subscription_id = ${var.ide_tasks_subscription}"
      single_instance_assignment = var.single_instance_max_task
    }

    cpu_utilization {
      target = 0.6
    }
  }
}
