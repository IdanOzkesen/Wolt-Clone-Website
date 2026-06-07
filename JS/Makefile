.PHONY: build run up

# docker build the image with the tag "node-api-server" using the Dockerfile in the current directory
build:
	docker build -t node-api-server .

# docker run the container with the name "node-api-server" and map the host port 3000 to the container port 3000, and use the host network
run:
	docker run -it --init --rm -p 10000:10000 -e TCP_HOST=host.docker.internal node-api-server
# run the build and run targets in sequence
up: build run