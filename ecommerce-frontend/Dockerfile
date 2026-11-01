# Shop image. Each line is one step Docker runs from top to bottom.

# Start from a small Linux image that already has Node.js.
FROM node:20-alpine

# All later commands run inside this folder in the image.
WORKDIR /app

# Copy package.json first so npm install is cached when only source code changes.
COPY package*.json ./

# Install React, Vite, and the other shop libraries.
RUN npm install

# Copy the shop source. .env is not copied (.dockerignore).
COPY . .

# Vite listens on this port inside the container.
EXPOSE 5173

# --host lets the browser on your PC reach the server inside the container.
CMD ["npm", "run", "dev", "--", "--host"]
