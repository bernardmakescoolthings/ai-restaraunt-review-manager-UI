# Use Node.js LTS version
FROM node:20-alpine

WORKDIR /app

# Create app directory and set permissions
RUN mkdir -p /app/.next && \
    chown -R node:node /app

# Switch to non-root user
USER node

# Copy package files with correct ownership
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application with correct ownership
COPY --chown=node:node . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"] 