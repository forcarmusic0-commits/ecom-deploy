# Markethouse — E-commerce Frontend (React + TypeScript)

A teaching-grade frontend for the [ecommerce-backend](../ecommerce-backend) project: Vite + React + TypeScript + Tailwind, talking to the Node/Express API over JWT auth, with a role-aware dashboard (user / seller / admin) and a live Socket.IO chat.

---

## 1. Folder structure

```
ecommerce-frontend/
├── src/
│   ├── main.tsx              # entry point, wraps the app in Auth/Socket/Cart providers
│   ├── App.tsx                # all routes
│   ├── index.css              # Tailwind + design tokens
│   ├── types/index.ts         # TypeScript types mirroring the backend's Mongoose/Sequelize models
│   ├── api/                   # one file per backend resource, thin axios wrappers
│   │   └── axios.ts           # the important one: access-token + auto-refresh interceptor
│   ├── context/
│   │   ├── AuthContext.tsx    # login/register/logout, silent session restore on load
│   │   ├── CartContext.tsx    # cart state, reloads whenever the logged-in user changes
│   │   └── SocketContext.tsx  # socket.io-client connection, authenticated with the JWT
│   ├── components/
│   │   ├── layout/            # Navbar, Footer, Layout
│   │   ├── common/            # ProtectedRoute, RoleRoute, Loader, StarRating, EmptyState
│   │   ├── product/           # ProductCard, ProductFilters, ReviewList, ReviewForm
│   │   ├── cart/               # CartItemRow
│   │   ├── chat/               # ChatRoomList, ChatWindow
│   │   └── dashboard/          # StatsCards, UsersTable, OrdersTable, ProductsTable, ProductFormModal
│   └── pages/                  # one file per route (see table below)
```

## 2. Setup (without Docker)

Needs the backend running first (see the backend's own README).

```bash
cd ecommerce-frontend
npm install
cp .env.example .env     # defaults already point at http://localhost:5000
npm run dev
```
Opens on `http://localhost:5173`.

**Important:** your backend's `.env` needs `CLIENT_URL=http://localhost:5173` so its CORS and Google OAuth redirect allow this origin.

## 3. Setup with Docker

This project has its own `docker-compose.yml`, separate from the backend's — run both stacks side by side:

```bash
# terminal 1
cd ecommerce-backend
cp .env.example .env        # set CLIENT_URL=http://localhost:5173, JWT secrets, MYSQL_PASSWORD
docker compose up --build

# terminal 2
cd ecommerce-frontend
cp .env.example .env
docker compose up --build
```
Frontend on `http://localhost:5173`, API on `http://localhost:5000`. Both containers bind-mount your source code, so edits live-reload without rebuilding.

## 4. How auth actually works here (important to walk students through)

1. On login/register, the backend returns an **access token** in the JSON body and sets a **refresh token** as an httpOnly cookie.
2. The access token is kept in a plain JS variable inside `src/api/axios.ts` — **not** `localStorage`. This is deliberate: anything in `localStorage` is readable by any script on the page (XSS risk); an in-memory variable isn't, and the refresh cookie can't be read by JS either.
3. The trade-off: refreshing the browser tab wipes that variable. So `AuthContext` calls `POST /auth/refresh` once on app load — the browser sends the httpOnly cookie automatically, the backend returns a fresh access token, and the session is restored silently. This is the `isLoading` state you'll see guarding routes.
4. While the app is running, if any API call gets back a `401` (access token expired, ~15 min), the axios **response interceptor** in `axios.ts` automatically calls `/auth/refresh` once, then retries the original request with the new token — the user never notices. If the refresh itself fails (refresh token expired/revoked too), it gives up and the user is treated as logged out.
5. Google OAuth is a full browser redirect (`<a href={googleLoginUrl()}>`, not an axios call) because the login happens on Google's own page. It lands back on `/oauth-success?accessToken=...`, which reads that token and finishes the same way a normal login would.

## 5. Routes → pages → backend endpoints

| Route | Page | Access | Backend endpoint(s) used |
|---|---|---|---|
| `/` | Home | public | `GET /products`, `GET /categories` |
| `/products/:id` | ProductDetail | public | `GET /products/:id`, `POST /products/:id/reviews`, `POST /chat/rooms` |
| `/login` | Login | public | `POST /auth/login`, `GET /auth/google` |
| `/register` | Register | public | `POST /auth/register` |
| `/oauth-success` | OAuthSuccess | public | `GET /auth/me` |
| `/cart` | Cart | logged in | `GET/POST/PUT/DELETE /cart` |
| `/checkout` | Checkout | logged in | `POST /orders` |
| `/orders` | Orders | logged in | `GET /orders/my` |
| `/orders/:id` | OrderDetail | logged in | `GET /orders/:id`, `PUT /orders/:id/pay` |
| `/profile` | Profile | logged in | `GET/PUT /users/profile`, `PUT /users/change-password`, wishlist endpoints |
| `/chat` | Chat | logged in | `GET /chat/rooms`, `GET /chat/rooms/:id/messages` + socket events |
| `/dashboard` | Dashboard | seller/admin | `/admin/*`, `/orders` (admin), `/products` (create/update/delete) |

## 6. Socket.IO on the client side

`SocketContext` opens one connection per logged-in session:
```ts
io(SOCKET_URL, { auth: { token: accessToken } })
```
The backend's socket middleware verifies that JWT before accepting the connection (same `JWT_ACCESS_SECRET` as REST routes). `ChatWindow` does the rest: `join_room` on mount, `send_message` / `receive_message` for the conversation, `typing` / `stop_typing` for the indicator.

## 7. Design notes (for the "major project" presentation)

- Palette and type are defined once in `tailwind.config.js` (forest green / ochre / warm paper) and `index.css` — point students here when they want to re-skin it.
- `ProtectedRoute` and `RoleRoute` are composable: routes are nested so `/dashboard` requires *both* being logged in *and* having `seller` or `admin` role — good example of layered route guards.
- `Dashboard.tsx` shows the same page rendering different tabs based on `user.role` — a common real-world pattern instead of duplicating whole pages per role.

## 8. Suggested teaching order (pairs with the backend's)

1. `src/api/axios.ts` — the token-refresh interceptor, probably the single most instructive file in the project.
2. `AuthContext` — silent session restore, why the access token lives in memory not localStorage.
3. `ProtectedRoute` / `RoleRoute` — route guards and how they nest.
4. `Home` → `ProductDetail` → `Cart` → `Checkout` — the main shopping flow, and how `CartContext` keeps state in sync after every mutation.
5. `Dashboard.tsx` — role-based UI branching, reusing `ProductFormModal` for both sellers and admins.
6. `SocketContext` + `ChatWindow` — connecting a socket with the same JWT used for REST, and the join-room/send/receive event lifecycle.
