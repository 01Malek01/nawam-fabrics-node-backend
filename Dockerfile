# Use official Node.js 20 Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app


# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port (default: 5000)
EXPOSE 5000

# Start the server with nodemon for development
CMD ["npx", "nodemon", "server.js"]
