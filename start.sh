#!/bin/bash
docker start docker-mongo
deno run "$@" --allow-env --allow-net --allow-read ./src/index.ts 