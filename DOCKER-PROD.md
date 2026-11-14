# Production deployment on EC2

The production stack builds the API and frontend on the EC2 instance using
`docker-compose.prod.yml`. It serves the shop on `127.0.0.1:8080` and the API
on `127.0.0.1:5000`; host Nginx should terminate HTTPS and proxy requests for
`ecom.work.gd` to those local ports. Do not expose MySQL, MongoDB, or the API
ports publicly.

## Configure environment

If `ecommerce-backend/.env` does not exist on EC2, create it from the
production template:

```bash
cp ecommerce-backend/.env.production.example ecommerce-backend/.env
nano ecommerce-backend/.env
```

If `.env` already exists, do not overwrite it. Edit the existing file instead
so you don't lose the MySQL credentials used to initialize its data volume.
Add or update the production settings shown in
`ecommerce-backend/.env.production.example`.

Replace the MySQL and JWT placeholders with strong, unique values. Keep `.env`
private; do not commit it. If the stack has already initialized MySQL data,
preserve the existing `MYSQL_PASSWORD` and `MYSQL_ROOT_PASSWORD` values when
updating the file. Changing them in `.env` does not change passwords in an
already-initialized database volume.

To create the optional demo admin, set `DEMO_ADMIN_NAME`, `DEMO_ADMIN_EMAIL`,
and a unique `DEMO_ADMIN_PASSWORD` of at least 12 characters in `.env`. The
password is hashed before it is stored. The seed does not print or reset the
password, promote an existing non-admin account, or overwrite existing demo
products.

The template leaves Google OAuth credentials blank. If using Google login,
configure its client ID and secret, and register this callback URL with Google:

```text
https://ecom.work.gd/api/auth/google/callback
```

## Start or update the stack

Ensure DNS points `ecom.work.gd` to the EC2 instance, HTTPS is configured in
host Nginx, and the EC2 security group allows inbound ports 80 and 443. Then:

```bash
docker compose -f docker-compose.prod.yml config --quiet
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl https://ecom.work.gd/api/health
```

Host Nginx must proxy `/api/` and `/socket.io/` to `127.0.0.1:5000` and other
requests to `127.0.0.1:8080`. Socket.IO needs the WebSocket upgrade headers.

## Seed demo products and admin

After setting the `DEMO_ADMIN_*` values and starting the Compose services, run
the idempotent seed from the repository root:

```bash
docker compose -f docker-compose.prod.yml run --rm api npm run seed:demo
```

This creates the demo admin if the email is unused, three demo categories, and
six demo products. Existing categories/products are left intact. The admin
email and password are the values configured in the EC2 `.env`.

To stop containers without deleting database data:

```bash
docker compose -f docker-compose.prod.yml down
```

Do not add `-v` to `down` unless you intend to delete the database volumes.
