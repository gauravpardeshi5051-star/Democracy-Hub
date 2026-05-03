# Use the official lightweight Node.js image
FROM node:20-slim

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image
COPY package*.json ./

# Install dependencies (ignoring missing npm locally as Docker will have it)
RUN npm install --only=production

# Copy local code to the container image
COPY . .

# Expose port
EXPOSE 8080

# Run the web service on container startup
CMD [ "npm", "start" ]
