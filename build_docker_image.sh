#!/usr/bin/env bash

cd "$(dirname "$0")" || exit

docker image rm ifaisalalam/ctfhub-auth 2> /dev/null

docker build -t ifaisalalam/ctfhub-auth .
