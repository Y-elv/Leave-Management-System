# Stage 1: Build the application
FROM node:18 AS builder


WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.app.json ./   
COPY tsconfig.node.json ./  
COPY vite.config.* ./
COPY public ./public
COPY index.html ./   
COPY src ./src

RUN npm install
RUN npm run build  # This should work if tsconfig files are present

# Stage 2: Setup production environment with nginx
FROM nginx:alpine

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

# Copy build artifacts from the builder stage
COPY --from=builder /app/dist ./

# Expose port 80 for nginx
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
