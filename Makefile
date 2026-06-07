# --- Makefile for Advanced Systems Programming Project ---

# 1. Automatic Docker Command Detection
# This checks if 'docker compose' (V2) or 'docker-compose' (V1) is available
DOCKER_COMPOSE := $(shell docker compose version > /dev/null 2>&1 && echo "docker compose" || echo "docker-compose")

# 2. Capture all arguments after the command name
ARGS = $(filter-out $@,$(MAKECMDGOALS))

# --- Setup Commands ---

# Build and run containers in background
# Usage: make up
up:
	$(DOCKER_COMPOSE) up --build -d

# Stop everything
# Usage: make down
down:
	$(DOCKER_COMPOSE) down --remove-orphans

# --- Execution Commands ---

# Run Server (C++)
server:
	@docker exec -it recommendation_server ./build/run_server $(if $(ARGS),$(ARGS),8080)

# Run Client (Python)
client:
	@docker exec -it recommendation_client python3 -u src/client.py $(if $(ARGS),$(ARGS),server 8080)

# Run Tests (C++)
test:
	@docker exec -it recommendation_server ./build/run_tests

# --- Cleanup Commands ---

# Clean the database file (runs via docker to bypass permission issues)
clean:
	@echo "Cleaning up database..."
	@docker exec -it recommendation_server rm -f data/db.txt || true
	@touch data/db.txt
	@echo "Database is clean and ready."

# --- Helper to allow free-form arguments ---
%:
	@: