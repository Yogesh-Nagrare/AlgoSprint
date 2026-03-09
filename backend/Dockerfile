# backend/Dockerfile
FROM node:20-slim

# Install all three compilers in one layer
RUN apt-get update && apt-get install -y \
    g++ \
    default-jdk \
    python3 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

EXPOSE 3000
CMD ["node", "src/index.js"]