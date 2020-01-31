#!/usr/bin/env bash

docker image rm ifaisalalam/ide-worker-c 2> /dev/null
docker pull ifaisalalam/ide-worker-c

docker image rm ifaisalalam/ide-worker-cpp 2> /dev/null
docker pull ifaisalalam/ide-worker-cpp

docker image rm ifaisalalam/ide-worker-python2 2> /dev/null
docker pull ifaisalalam/ide-worker-python2

docker image rm ifaisalalam/ide-worker-python3 2> /dev/null
docker pull ifaisalalam/ide-worker-python3

docker image rm ifaisalalam/ide-worker-nodejs8 2> /dev/null
docker pull ifaisalalam/ide-worker-nodejs8
