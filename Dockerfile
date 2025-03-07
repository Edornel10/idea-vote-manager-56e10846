
# Build stage for backend and frontend
FROM node:20-alpine

# Set environment variable
ENV VITE_API_URL=/api

# Set working directory
WORKDIR /app

# Copy package.json files first for better caching
COPY package*.json ./
COPY api/package*.json ./api/

# Install dependencies
RUN npm ci
RUN cd api && npm install

# Copy application code
COPY . .

# Build the frontend
RUN npm run build

# Expose port
EXPOSE 3001

# Start application using Node.js
CMD ["node", "api/index.js"]
