#!/usr/bin/env bash

docker image ifaisalalam/ide-worker-c 2> /dev/null
docker pull ifaisalalam/ide-worker-c

docker image rm ifaisalalam/ide-worker-cpp 2> /dev/null
docker pull ifaisalalam/ide-worker-cpp
