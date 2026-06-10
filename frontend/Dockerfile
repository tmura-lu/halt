FROM node:20-alpine

WORKDIR /app

# Install dependencies based on package.json and package-lock (if present)
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Expose Vite default port
EXPOSE 5173

# Run Vite dev server listening on all interfaces
CMD ["npm","run","dev","--","--host"]
