
# Build stage for API
FROM node:20-alpine AS api-builder

WORKDIR /api
COPY api/package*.json ./
RUN npm install
COPY api .

# Build stage for frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Set environment variable
ENV VITE_API_URL=http://localhost:3001/api

# Copy built assets from the frontend builder stage
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy API files and install dependencies
COPY --from=api-builder /api /app/api
RUN apk add --no-cache nodejs npm

# Expose ports
EXPOSE 80 3001

# Start nginx and API server
COPY start.sh /start.sh
RUN chmod +x /start.sh
CMD ["/start.sh"]
