#!/usr/bin/env bash

cd "$(dirname "$0")" || exit

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker push ifaisalalam/ctfhub-auth
