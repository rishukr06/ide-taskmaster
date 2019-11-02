#!/usr/bin/env bash

cd "$(dirname "$0")" || exit

PWD=$(pwd)

if [ -z "$GCS_BUCKET_NAME" ]; then
  printf "Environment variable \$GCS_BUCKET_NAME is not set.\n"
  exit 1
fi

if [ -z "$GCS_BUCKET_PATH" ]; then
  printf "Environment variable \$GCS_BUCKET_PATH is not set.\n"
  exit 1
fi

cd ./terraform || (printf "Cannot find terraform directory.\n" && exit 1)

terraform init \
  --backend-config "bucket=$GCS_BUCKET_NAME" \
  --backend-config "path=$GCS_BUCKET_PATH"

terraform validate

terraform apply -auto-approve
