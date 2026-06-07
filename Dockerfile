# Use an official Ubuntu base image
FROM ubuntu:latest
# Avoid interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Update and install build tools + Python 3
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libgtest-dev \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Compile GTest
RUN cd /usr/src/gtest && cmake . && make && cp lib/*.a /usr/lib

# Set the internal working directory
WORKDIR /app

# Copy all project files
COPY . .

# Build the project
RUN mkdir -p build && cd build && \
    cmake .. && \
    make

# Default command (can be overridden by docker-compose)
CMD ["./build/run_server", "8080"]