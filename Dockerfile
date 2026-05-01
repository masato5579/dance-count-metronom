FROM node:20-slim

# Install dependencies for audio generation
RUN apt-get update && apt-get install -y --no-install-recommends \
    espeak-ng \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files if they exist, install deps
COPY package*.json* ./
RUN if [ -f package.json ]; then npm install; fi

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
