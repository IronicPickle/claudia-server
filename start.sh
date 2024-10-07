#!/bin/bash

DB_CONTAINER_NAME=$1

if [ ! $DB_CONTAINER_NAME ]; then
  DB_CONTAINER_NAME="docker-mongo"
fi

docker start $DB_CONTAINER_NAME
deno run "${@:2}" --allow-env --allow-net --allow-read ./src/index.ts 