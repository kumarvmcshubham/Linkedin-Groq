# Step 1: Use Node.js base image
FROM node:18

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy all files into the container
COPY . .

# Step 4: Install dependencies
RUN npm install

# Step 5: Expose the port your app runs on
EXPOSE 4000

# Step 6: Start the server
CMD ["node", "server.js"]
