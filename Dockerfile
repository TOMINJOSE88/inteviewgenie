# Use the official Node.js 18 Alpine image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /home/node/app

# Install dependencies first to leverage Docker caching
# Copy only the package.json and package-lock.json
COPY package*.json ./

# Install production dependencies (add --production to avoid dev dependencies)
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port that your application will run on
EXPOSE 5000

# Use a non-root user for running the application
USER node

# Command to run the application
CMD [ "npm", "start" ]