#!/usr/bin/env bash

docker run \
--rm \
--mount 'type=bind,src=/tmp/box,dst=/tmp/box' \
--mount 'type=bind,src=/var/run/docker.sock,dst=/var/run/docker.sock' \
--user root \
ifaisalalam/ide-taskmaster \
sh -c "npm install -D && exec npm run test"
