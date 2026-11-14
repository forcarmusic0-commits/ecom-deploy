# Production images

`DOCKER.md` is the dev run. This file is the production run: a built shop, the same API process, and how those images are different when you push them to Docker Hub.

Dev and production can both be installed on one PC. They use different image tags and different Compose files, so one push does not overwrite the other.

| | Dev | Production |
| --- | --- | --- |
| Guide | `DOCKER.md` | this file |
| Compose file | `docker-compose.yml` | `docker-compose.prod.yml` |
| API Dockerfile | `ecommerce-backend/Dockerfile` | `ecommerce-backend/Dockerfile.prod` |
| Shop Dockerfile | `ecommerce-frontend/Dockerfile` | `ecommerce-frontend/Dockerfile.prod` |
| API image | `markethouse-api:1.0` | `markethouse-api:1.0-prod` |
| Shop image | `markethouse-web:1.0` | `markethouse-web:1.0-prod` |
| Shop URL | http://localhost:5173 | http://localhost |
| API URL | http://localhost:5000 | http://localhost:5000 |

Do not run both Compose files at the same time. Both want port 5000 for the API.

## What is different

### API

The two API Dockerfiles are the same steps. There is no nodemon in either image. `CMD` is `npm start`, which is `node server.js`. Libraries are installed with `npm install --omit=dev`.

The production Compose file changes one setting the dev file does not: `CLIENT_URL=http://localhost`. The production shop is served on port 80, and the browser sends that origin. The dev shop is on port 5173, so its `CLIENT_URL` stays `http://localhost:5173`.

### Shop

This is the real difference.

| | `Dockerfile` (dev) | `Dockerfile.prod` |
| --- | --- | --- |
| What runs | Vite dev server, `npm run dev --host` | `npm run build`, then nginx serves the `dist` folder |
| Port inside the image | 5173 | 80 |
| Source code in the final image | yes | no, only the built files |
| When `VITE_API_URL` is read | every time the container starts, from `.env` | once, while the image is built |
| After you change the API URL | restart the container | build the image again |

`Dockerfile.prod` has two stages. The first stage is Node. It compiles the React app into static files. The second stage is nginx. It copies only `dist`. The Node toolchain is not in the image you run or push.

nginx here is not a proxy in front of the API. It only serves the shop files. A refresh on `/cart` would 404 without `nginx.conf`, because that path is a React route, not a real file. `try_files` sends those requests to `index.html`.

The production Compose file passes the API address as a build argument:

```text
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Those strings are compiled into the JavaScript. Changing them in `.env` later does nothing for this image until you build again.

## Run the production stack

Docker Desktop must be running. `ecommerce-backend/.env` must already contain `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, and `MYSQL_DATABASE`, as in `DOCKER.md`.

From the project root:

```powershell
docker compose -f docker-compose.prod.yml up -d --build
```

`-f docker-compose.prod.yml` selects the production file. Without `-f`, Compose uses `docker-compose.yml`, which is the dev stack. `--build` creates `markethouse-api:1.0-prod` and `markethouse-web:1.0-prod`.

```powershell
docker compose -f docker-compose.prod.yml ps
```

Open http://localhost for the shop and http://localhost:5000/api/health for the API.

Stop it:

```powershell
docker compose -f docker-compose.prod.yml down
```

`down` removes these containers. It does not remove the dev containers if those were started from the other file. Both files share the names `mongo_data` and `mysql_data` only if the Compose project name matches. This file uses the project name of the folder, same as the dev file, so they share the database volumes. Stop the dev stack before starting this one, because port 5000 can belong to only one API container.

## Push production images to Docker Hub

The tag is `1.0-prod`, not `1.0`. Pushing `1.0` would replace the dev image on Hub.

1. Create the repos `markethouse-api` and `markethouse-web` if they do not exist. One repo can hold many tags. `1.0` and `1.0-prod` are two tags in the same repo.
2. Log in:

```powershell
docker login
```

3. Add your Hub username and upload. Replace `YOUR_DOCKERHUB_USER`:

```powershell
docker tag markethouse-api:1.0-prod YOUR_DOCKERHUB_USER/markethouse-api:1.0-prod
docker tag markethouse-web:1.0-prod YOUR_DOCKERHUB_USER/markethouse-web:1.0-prod
docker push YOUR_DOCKERHUB_USER/markethouse-api:1.0-prod
docker push YOUR_DOCKERHUB_USER/markethouse-web:1.0-prod
```

`docker tag` only renames. `docker push` uploads that tag. On the Hub page you should see both `1.0` (dev, if you pushed it) and `1.0-prod` (this build).

The production shop image is smaller than the dev shop image because it does not contain the React source or `node_modules`. The API images are almost the same size, because both Dockerfiles run the same steps.

If the public site will not be `http://localhost`, set the real API URL in `docker-compose.prod.yml` under `web.build.args`, set `CLIENT_URL` to the real shop origin, then run `docker compose -f docker-compose.prod.yml build` again before `docker tag` and `docker push`. The shop image will not pick up a new URL any other way.
