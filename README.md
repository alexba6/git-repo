# Git repo

## Overview

Git repo help you to manage your project and deploy then on your own server. 

## Initialisation

First install the dependencies with :

```sh 
npm install
```
Add SSL certificates :

````sh
mkdir keys 
openssl req -newkey rsa:2048 -nodes -keyout keys/server-api.key -x509 -days 365 -out keys/server-api.crt 
openssl genrsa -out keys/jwt.key 2048
````

Then set the environment variables, you could use `.env` for all environment 
or specify the file with the following environment like `test.env`, `development.env` or `production.env`.
```ini
# Basic
DEBUG=<bolean>
NODE_ENV=<production or test or development>

# Server
SERVER_PORT=<number>
SERVER_HOST=<string>

# Database
DATABASE_HOST==<string>
DATABASE_PORT=<number>
DATABASE_USER=<string>
DATABASE_PASSWORD=<string>
DATABASE_NAME=<string>

# Store
REPO_STORE_PATH=<string>
TEMP_STORE=<string>

# Actions
DOCKER_SOCK=<string default /var/run/docker.sock>
```

## Run

### Development
```sh 
npm run dev
```
### Test
```sh 
npm run test
```
### Production
```sh 
npm run build
npm start
```

## Services

Git repo has some services for your project.

| Service name     | Requirements                |Description  |
|------------|-----------------------------|-----|
| **Docker** | [docker](https://www.docker.com) |Build your project after push it.|