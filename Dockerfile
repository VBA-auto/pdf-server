# Step 1: Use the official Playwright base image
FROM mcr.microsoft.com/playwright:v1.43.1-jammy

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package files and install
COPY package*.json ./
RUN npm install

# Step 4: Copy all project files
COPY . .

# Step 5: Expose port and start server
EXPOSE 3000
CMD ["node", "index.js"]
