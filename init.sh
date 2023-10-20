if [ ! "$(docker ps -a -q -f name=docker-mongo)" ]; then
  echo "> Configuring mongo docker container"
  docker pull mongo
  docker run -p 127.0.0.1:27017:27017/tcp --name docker-mongo -d mongo:latest
else
  echo "> Mongo docker container already exists, skipping..."
fi

if [ ! -e .env ]; then
  echo "> Generating .env file"
  echo "DENO_ENV=development" >> .env
  echo "" >> .env
  echo "AUTH_SECRET=keyboard_cat" >> .env
else
  echo "> .env already exists, skipping..."
fi