#!/usr/bin/env bash

cd "$(dirname "$0")" || exit

docker network create --internal --subnet 10.1.1.0/24 no-internet

docker image rm ifaisalalam/ide-taskmaster 2> /dev/null

docker build -t ifaisalalam/ide-taskmaster .
