# API image. Each line is one step Docker runs from top to bottom.

# Start from a small Linux image that already has Node.js.
FROM node:22-alpine

# All later commands run inside this folder in the image.
WORKDIR /app

# Copy package.json first so npm install is cached when only source code changes.
COPY package*.json ./

# Install the libraries the API needs. Skip dev tools such as nodemon.
RUN npm install --omit=dev

# Copy the server code. .env is not copied (.dockerignore).
COPY server.js ./
COPY src ./src

# The app listens on this port inside the container.
EXPOSE 5000

# Command that runs when the container starts: node server.js
CMD ["npm", "start"]
