FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Create necessary directories
RUN mkdir -p logs uploads/images uploads/documents uploads/temp

# Expose port
EXPOSE 5000

# Start the application
CMD [ "node", "src/server.js" ]