# E-Commerce Backend (Node + Express)

A complete, teachable e-commerce backend covering everything students usually need to see in one project:

- **MongoDB (Mongoose)** for the core e-commerce data: users, products, categories, cart, orders, reviews — all wired with `.populate()` including **nested populate**.
- **JWT auth**: short-lived **access tokens** + long-lived **refresh tokens** (rotation + revocation via a `refreshTokens[]` array on the user).
- **bcryptjs** password hashing via a Mongoose pre-save hook.
- **Google OAuth 2.0** login via Passport, that links/creates a Mongo user.
- **Role-based access control**: `user`, `seller`, `admin`.
- **Socket.IO real-time chat**, authenticated with the same JWT, persisted in **MySQL (Sequelize)** — so students see two databases used for two different jobs in one backend.
- Centralized error handling, consistent API response shape, pagination, search & filters.

---

## 1. Folder structure

```
ecommerce-backend/
├── server.js                  # entry point: connects DBs, starts HTTP + Socket.IO
├── src/
│   ├── app.js                 # express app, all routes mounted here
│   ├── config/
│   │   ├── db.mongo.js        # mongoose connection
│   │   ├── db.mysql.js        # sequelize connection
│   │   └── passport.js        # Google OAuth strategy
│   ├── models/
│   │   ├── mongo/              # User, Product, Category, Cart, Order, Review
│   │   └── mysql/              # ChatRoom, Message (Sequelize)
│   ├── middlewares/
│   │   ├── auth.middleware.js  # protect (verifies access token)
│   │   ├── role.middleware.js  # authorize("admin", ...)
│   │   └── error.middleware.js # notFound + errorHandler
│   ├── controllers/            # business logic, one file per resource
│   ├── routes/                 # express routers, one file per resource
│   ├── sockets/
│   │   └── chat.socket.js      # socket.io connection + events
│   └── utils/
│       ├── generateTokens.js
│       ├── apiError.js
│       └── apiResponse.js
```

## 2. Setup

```bash
cd ecommerce-backend
npm install
cp .env.example .env       # then fill in real values
npm run dev                # nodemon, auto-restarts on change
```

You need a running **MongoDB** instance and a running **MySQL** instance (MySQL is only used for chat).
Google OAuth is optional — the server logs a warning and skips it if `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` aren't set, so students can teach everything else without setting up a Google Cloud project.

## 3. Auth flow (the important part to explain to students)

1. `POST /api/auth/register` or `/login` → server creates an **access token** (15 min) and a **refresh token** (7 days).
   - Access token → returned in the JSON body, client keeps it in memory / stores it and sends it as `Authorization: Bearer <token>` on every request.
   - Refresh token → set as an **httpOnly cookie** (can't be read by JS, protects against XSS) and also pushed into `user.refreshTokens[]` in MongoDB (so it can be revoked).
2. When the access token expires, client calls `POST /api/auth/refresh` (cookie sent automatically) → server checks the refresh token against the DB and issues a new access token.
3. `POST /api/auth/logout` removes that refresh token from the DB and clears the cookie — so a stolen refresh token is no longer usable after logout.
4. `protect` middleware (`src/middlewares/auth.middleware.js`) verifies the access token on every protected route and attaches `req.user`.
5. `authorize("admin")` / `authorize("seller","admin")` middleware then checks `req.user.role`.

## 4. Google OAuth flow

1. Frontend redirects the browser to `GET /api/auth/google`.
2. Passport redirects to Google, user logs in, Google redirects back to `GET /api/auth/google/callback`.
3. Passport strategy (`src/config/passport.js`) finds-or-creates a Mongo `User` by `googleId`/email.
4. `googleCallback` controller issues the same access/refresh token pair as normal login, and redirects to the frontend with the access token in the URL (`?accessToken=...`) — frontend reads it once and stores it.

## 5. Populate examples worth showing in class

- `Product.findById(id).populate("category").populate({ path: "reviews", populate: { path: "user" } })` — **nested populate**.
- `Cart.findOne({ user }).populate("items.product")` — populating inside an **array of subdocuments**.
- `Order.find().populate("orderItems.product").populate("user")` — multiple populates on one query.
- MySQL's equivalent of populate is Sequelize's `include`: `ChatRoom.findByPk(id, { include: [{ model: Message, as: "messages" }] })`.

## 6. All routes

### Auth — `/api/auth`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/register` | public | create account |
| POST | `/login` | public | email+password login |
| POST | `/refresh` | cookie | get new access token |
| POST | `/logout` | public | revoke refresh token |
| GET | `/me` | access token | current user |
| GET | `/google` | public | start Google OAuth |
| GET | `/google/callback` | public | Google OAuth callback |

### Users — `/api/users` (all require access token)
| Method | Route | Description |
|---|---|---|
| GET | `/profile` | get profile (wishlist populated) |
| PUT | `/profile` | update name/phone/avatar/addresses |
| PUT | `/change-password` | change password |
| POST | `/wishlist/:productId` | add to wishlist |
| DELETE | `/wishlist/:productId` | remove from wishlist |

### Categories — `/api/categories`
| Method | Route | Auth |
|---|---|---|
| GET | `/` | public |
| GET | `/:id` | public |
| POST | `/` | admin |
| PUT | `/:id` | admin |
| DELETE | `/:id` | admin |

### Products — `/api/products`
| Method | Route | Auth | Notes |
|---|---|---|---|
| GET | `/` | public | `?keyword=&category=&minPrice=&maxPrice=&sort=&page=&limit=` |
| GET | `/:id` | public | full populate incl. reviews.user |
| POST | `/` | seller/admin | create |
| PUT | `/:id` | seller (owner) / admin | update |
| DELETE | `/:id` | seller (owner) / admin | delete |
| POST | `/:id/reviews` | any logged-in user | add review, recalculates rating |

### Cart — `/api/cart` (all require login)
| Method | Route |
|---|---|
| GET | `/` |
| POST | `/` |
| PUT | `/:productId` |
| DELETE | `/:productId` |
| DELETE | `/` |

### Orders — `/api/orders` (all require login)
| Method | Route | Auth |
|---|---|---|
| POST | `/` | any user — builds order from cart |
| GET | `/my` | any user |
| GET | `/:id` | owner or admin |
| PUT | `/:id/pay` | owner |
| GET | `/` | admin — all orders |
| PUT | `/:id/deliver` | admin |

### Admin — `/api/admin` (all admin-only)
| Method | Route |
|---|---|
| GET | `/dashboard` |
| GET | `/users` |
| PUT | `/users/:id/role` |
| PUT | `/users/:id/deactivate` |
| DELETE | `/products/:id` |

### Chat — `/api/chat` (all require login, data lives in MySQL)
| Method | Route |
|---|---|
| POST | `/rooms` — get or create a room with a seller |
| GET | `/rooms` — all my rooms |
| GET | `/rooms/:roomId/messages` |

## 7. Socket.IO events

Connect with the access token:
```js
const socket = io("http://localhost:5000", { auth: { token: accessToken } });
```

| Event (client emits) | Payload | What happens |
|---|---|---|
| `join_room` | `roomId` | joins that room's channel |
| `send_message` | `{ roomId, text }` | saves to MySQL, broadcasts `receive_message` |
| `typing` / `stop_typing` | `{ roomId }` | broadcasts to others in room |
| `mark_read` | `{ roomId }` | marks messages read, broadcasts `messages_read` |

| Event (server emits) | Payload |
|---|---|
| `receive_message` | the saved message |
| `user_online` / `user_offline` | `{ userId }` |
| `typing` / `stop_typing` | `{ userId }` |
| `messages_read` | `{ roomId, readBy }` |

## 8. Suggested teaching order

1. Show `User` model → bcrypt pre-save hook → why we `select: false` the password.
2. Build auth controller live: register/login → explain access vs refresh token.
3. `protect` + `authorize` middlewares → role-based routes.
4. Product CRUD → introduce `.populate()`, then nested populate on reviews.
5. Cart → Order (show stock decrement + price snapshot pattern).
6. Admin dashboard → aggregation pipeline for revenue.
7. Google OAuth → walk through the passport strategy step by step.
8. Switch to MySQL: same `.env`-driven Sequelize connection, `sync()`, associations (`hasMany`/`belongsTo`) as MySQL's populate.
9. Socket.IO: JWT verified in the handshake, then `join_room` / `send_message`, persisted to MySQL, broadcast to the room.

## 9. Notes / things to point out as "real world" details

- Passwords are never returned from the API (`select: false` on the schema + explicit `.select("+password")` only where needed).
- Refresh tokens are stored server-side so they can be revoked — a pure stateless JWT refresh token can't be logged out.
- Product `slug` and price snapshot in cart/order items show why you shouldn't always trust "the current price" — order stores the price *at the time of purchase*.
- Two databases in one app is deliberately included so students see how to pick the right tool: relational (MySQL) for high write-throughput conversational data, document (MongoDB) for the flexible/nested catalog data.
