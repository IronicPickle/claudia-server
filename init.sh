#!/bin/bash
set -e

printf "\e[95m_________ .__                   .___.__        
\_   ___ \|  | _____   __ __  __| _/|__|____   
/    \  \/|  | \__  \ |  |  \/ __ | |  \__  \  
\     \___|  |__/ __ \|  |  / /_/ | |  |/ __ \_
 \______  /____(____  /____/\____ | |__(____  /
        \/          \/           \/         \/ \e[0m\n"

printf "\e[1m> \e[33mClaudia Server\e[0m\e[1m initialisation script\e[0m\n"

BRANCH=$1
USERNAME=$2
TOKEN=$3
NO_DB=$4
CURR_DIR=$PWD

DB_USERNAME=""
DB_PASSWORD=""

# Check if branch is configured in args
if [ ! $BRANCH ]; then
  printf "  > Branch to init with:\e[0m\n"
  read -p "  > " BRANCH
fi

printf "\n\e[1m> Starting initialisation with branch:\e[0m\n"
printf "\e[34m  > ${BRANCH}\e[0m\n"

# Setup shared enviro
printf "\n\\e[1m> Installing \e[33mclaudia-shared\e[0m\e[1m environment\e[0m\n\n"

mkdir -p ../claudia-shared
cd ../claudia-shared

if [ ! -d "./.git" ]; then
  if [ $USERNAME ] && [ $TOKEN ]; then
    git clone -b $BRANCH "https://${USERNAME}:${TOKEN}@github.com/IronicPickle/claudia-shared.git" .
  else
    git clone -b $BRANCH git@github.com:IronicPickle/claudia-shared.git .
  fi
fi

cd $CURR_DIR

# Setup main enviro
printf "\n\\e[1m> Installing \e[33mclaudia-server\e[0m\e[1m environment\e[0m\n\n"

if [ "$NO_DB" != "true" ]; then
  if [ ! "$(docker ps -a -q -f name=docker-mongo)" ]; then
    echo "Configuring mongo docker container"
    docker pull mongo
    read -p "Enter MongoDB admin username: " DB_USERNAME
    read -p "Enter MongoDB admin password: " DB_PASSWORD
    docker run -d -p 127.0.0.1:27017:27017/tcp --name docker-mongo \
      -e MONGO_INITDB_ROOT_USERNAME=$DB_USERNAME \
      -e MONGO_INITDB_ROOT_PASSWORD=$DB_PASSWORD \
      mongo:latest
  else
    echo "Mongo docker container already exists, skipping..."
  fi
fi

if [ ! -e .env ]; then
  printf "Generating .env file"
  echo "DENO_ENV=development" >> .env
  echo "" >> .env
  echo "MONGO_ADDRESS=mongodb://$DB_USERNAME:$DB_PASSWORD@127.0.0.1:27017" >> .env
  echo "" >> .env
  echo "DISCORD_CLIENT_ID=" >> .env
  echo "DISCORD_CLIENT_SECRET=" >> .env
  echo "" >> .env
  echo "AUTH_SECRET=keyboard_cat" >> .env
else
  printf ".env already exists, skipping..."
fi

printf "\n\\e[1m> Initialisation done, \e[33mclaudia Server\e[0m\e[1m ready\e[0m\n"
