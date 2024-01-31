if [ ! "$(docker ps -a -q -f name=docker-mongo)" ]; then
  echo "> Configuring mongo docker container"
  docker pull mongo
  read -p "Enter MongoDB admin username: " username
  read -p "Enter MongoDB admin password: " password
  docker run -d -p 127.0.0.1:27017:27017/tcp --name docker-mongo \
    -e MONGO_INITDB_ROOT_USERNAME=$username \
    -e MONGO_INITDB_ROOT_PASSWORD=$password \
    mongo:latest
else
  echo "> Mongo docker container already exists, skipping..."
fi

if [ ! -e .env ]; then
  echo "> Generating .env file"
  echo "DENO_ENV=development" >> .env
  echo "" >> .env
  echo "MONGO_ADDRESS=mongodb://$username:$password@127.0.0.1:27017" >> .env
  echo "" >> .env
  echo "DISCORD_CLIENT_ID=" >> .env
  echo "DISCORD_CLIENT_SECRET=" >> .env
  echo "" >> .env
  echo "AUTH_SECRET=keyboard_cat" >> .env
else
  echo "> .env already exists, skipping..."
fi