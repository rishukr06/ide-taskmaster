output "instance_group" {
  value = google_compute_instance_group_manager.ide_taskmaster_2_instance_group.instance_group
}

output "instance_group_self_link" {
  value = google_compute_instance_group_manager.ide_taskmaster_2_instance_group.self_link
}
