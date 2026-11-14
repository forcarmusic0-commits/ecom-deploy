# How to run Markethouse with Docker

This is the dev stack (Vite on port 5173). The production build, and how its Docker Hub tags differ, is in `DOCKER-PROD.md`.

This file is the run guide for the four containers: MongoDB, MySQL, the API, and the shop. It also explains both Dockerfiles line by line.

You do not install Node, MongoDB, or MySQL on your PC. Docker Desktop runs them.

## What starts

| Service | Image | Address on your PC | Job |
| --- | --- | --- | --- |
| `mongo` | `mongo:7` | inside Docker only | products, users, orders |
| `mysql` | `mysql:8.0` | inside Docker only | chat rooms and messages |
| `api` | `markethouse-api:1.0` | http://localhost:5000 | Express API |
| `web` | `markethouse-web:1.0` | http://localhost:5173 | React shop |

The shop in the browser calls the API at `localhost:5000`. The API talks to the databases by the names `mongo` and `mysql`. Those names only work between containers.

## 1. Install Docker and make the env files

Install Docker Desktop and leave it running.

From the project root (`C:\Users\PRITAM\Downloads\ecommerce-backend`):

```powershell
copy ecommerce-backend\.env.example ecommerce-backend\.env
copy ecommerce-frontend\.env.example ecommerce-frontend\.env
```

`copy` makes a real env file from the example. Do this only if the `.env` file is not already there.

Open `ecommerce-backend\.env` and set:

```text
CLIENT_URL=http://localhost:5173
MYSQL_DB=ecommerce_chat
MYSQL_DATABASE=ecommerce_chat
MYSQL_PASSWORD=yourpassword
MYSQL_ROOT_PASSWORD=yourpassword
```

`MYSQL_PASSWORD` and `MYSQL_ROOT_PASSWORD` must be the same word. MySQL will not start if `MYSQL_ROOT_PASSWORD` is missing.

Open `ecommerce-frontend\.env` and set:

```text
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

The browser uses these two URLs. Keep them on `localhost`.

## 2. Build the images and start the containers

Still in the project root:

```powershell
docker compose up -d --build
```

What that command does:

- `docker compose` reads `docker-compose.yml` in this folder.
- `--build` builds `markethouse-api:1.0` and `markethouse-web:1.0` from the two Dockerfiles. MongoDB and MySQL are downloaded, not built.
- `-d` runs the containers in the background so you get your terminal back.
- The API waits until MySQL answers a ping. Then it starts.

Check:

```powershell
docker compose ps
```

`ps` shows status. All four rows should say `running` or `healthy`.

```powershell
docker compose logs api
```

`logs api` prints the API output. You want these lines:

```text
[MongoDB] Connected: mongo
[MySQL] Connected successfully
Server running on http://localhost:5000
```

Open http://localhost:5173 for the shop. The API health check is http://localhost:5000/api/health.

## 3. Stop and start again

```powershell
docker compose stop
```

`stop` pauses the containers. Images and database data stay.

```powershell
docker compose up -d
```

`up -d` starts them again. Leave off `--build` unless you changed a Dockerfile or the app code.

```powershell
docker compose down
```

`down` deletes the containers. The images and the `mongo_data` and `mysql_data` volumes stay, so products and chats are still there next time.

```powershell
docker compose down -v
```

`down -v` also deletes the database volumes. The next start is an empty shop.

## 4. Upload the images to Docker Hub

Upload only the two images you built: `markethouse-api:1.0` and `markethouse-web:1.0`. MongoDB and MySQL are already public images. Do not push them, and do not put `.env` in an image.

### 4.1 Create the account and the repos

1. Open https://hub.docker.com and create an account. The username is the first part of every image name, for example `pritam/markethouse-api`.
2. Click **Create repository**. Name it `markethouse-api`. Visibility can be Public.
3. Create a second repository named `markethouse-web`.

A repository is the empty shelf. `docker push` fills it. If you skip this, the first push still creates a public repo for a normal account.

### 4.2 Confirm the images exist on this PC

From the project root:

```powershell
docker images
```

`docker images` lists what is already built. You need these two rows before you tag anything:

```text
markethouse-api    1.0
markethouse-web    1.0
```

If they are missing, build them first:

```powershell
docker compose up -d --build
```

### 4.3 Log in from the terminal

```powershell
docker login
```

`docker login` asks for your Docker Hub username and password. Use an access token from Docker Hub **Account Settings → Personal access tokens** if the password is rejected. A successful login prints `Login Succeeded`. This PC can then upload.

### 4.4 Rename the images so Hub will accept them

Hub rejects `markethouse-api:1.0` because the name does not start with your username. `docker tag` adds a second name. It does not rebuild and does not delete the old name. Replace `YOUR_DOCKERHUB_USER` with the username from step 4.1:

```powershell
docker tag markethouse-api:1.0 YOUR_DOCKERHUB_USER/markethouse-api:1.0
docker tag markethouse-web:1.0 YOUR_DOCKERHUB_USER/markethouse-web:1.0
```

The word after the colon, `1.0`, is the version tag. The next time you change the app, use `1.1` or `latest` the same way on both images.

### 4.5 Upload

```powershell
docker push YOUR_DOCKERHUB_USER/markethouse-api:1.0
docker push YOUR_DOCKERHUB_USER/markethouse-web:1.0
```

`docker push` sends the image layers to Docker Hub. The first push is slow. Later pushes send only the layers that changed.

When it finishes, open:

```text
https://hub.docker.com/r/YOUR_DOCKERHUB_USER/markethouse-api
https://hub.docker.com/r/YOUR_DOCKERHUB_USER/markethouse-web
```

Each page should show the tag `1.0`.

### 4.6 Pull them on another machine

On a second PC, after `docker login` if the repos are private:

```powershell
docker pull YOUR_DOCKERHUB_USER/markethouse-api:1.0
docker pull YOUR_DOCKERHUB_USER/markethouse-web:1.0
```

`docker pull` downloads the image. You still need `docker-compose.yml` and both `.env` files on that machine. Those files were never uploaded.

## The API Dockerfile

File: `ecommerce-backend/Dockerfile`. Docker runs it from top to bottom to make `markethouse-api:1.0`.

```dockerfile
FROM node:22-alpine
```

Start from a small Linux image that already has Node 22. Every later line adds a layer on top of this.

```dockerfile
WORKDIR /app
```

Create `/app` in the image and run the next commands there.

```dockerfile
COPY package*.json ./
RUN npm install --omit=dev
```

Copy only `package.json` and `package-lock.json`, then install libraries. Dev tools such as nodemon are skipped. Doing this before copying the source means Docker can reuse this layer when you change only `server.js` or `src`.

```dockerfile
COPY server.js ./
COPY src ./src
```

Copy the API code. `.dockerignore` blocks `.env`, so secrets are not baked into the image. Compose injects `ecommerce-backend/.env` when the container starts.

```dockerfile
EXPOSE 5000
```

Documents that the process listens on port 5000. This does not publish the port. `docker-compose.yml` does that with `"5000:5000"`.

```dockerfile
CMD ["npm", "start"]
```

The process that runs when the container starts. In `package.json`, `start` is `node server.js`.

Inside the container, Compose replaces the database hosts:

```text
MONGO_URI=mongodb://mongo:27017/ecommerce_db
MYSQL_HOST=mysql
```

`mongo` and `mysql` are the service names in `docker-compose.yml`. `127.0.0.1` inside the API container would be the API container itself, not your PC and not the database containers.

## The shop Dockerfile

File: `ecommerce-frontend/Dockerfile`. Docker runs it to make `markethouse-web:1.0`.

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
```

Same pattern as the API: Node image, folder, then install. This install keeps the dev libraries because the container runs the Vite dev server.

```dockerfile
COPY . .
```

Copy the React source. `.env` is excluded by `.dockerignore`. Compose passes `ecommerce-frontend/.env` in at start, which is how `VITE_API_URL` reaches Vite.

```dockerfile
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
```

`npm run dev` starts Vite. `--host` makes Vite listen on all interfaces, so the browser on your PC can open `http://localhost:5173`. Without `--host`, Vite listens only inside the container and the page will not load.

Compose publishes that port with `"5173:5173"`. The first number is the port on your PC. The second number is the port inside the container. They match `EXPOSE`.
