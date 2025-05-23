DOCKER_COMPOSE = docker compose
COMPOSE_FILE ?= docker-compose.yml
BACKEND = backend
NEXTCLOUD_IMAGE = ghcr.io/nextcloud-releases/all-in-one:latest
NEXTCLOUD_CONTAINER = nextcloud-aio-mastercontainer
NEXTCLOUD_VOLUME = nextcloud_aio_mastercontainer

up:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) up -d

down:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down

build:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) up -d --build

push:
	docker push $(BACKEND_IMAGE)

pull:
	docker pull $(BACKEND_IMAGE)

pip_install:
	pip install -r backend\requirements.txt

lint:
	isort .
	flake8 --config setup.cfg
	black --config pyproject.toml .

check_lint:
	$(DOCKER_COMPOSE) exec $(BACKEND) isort --check --diff ../.
	$(DOCKER_COMPOSE) exec $(BACKEND) flake8 --config ../setup.cfg
	$(DOCKER_COMPOSE) exec $(BACKEND) black --check --config ../pyproject.toml ../.

check_lint_local:
	isort --check --diff .
	flake8 --config setup.cfg
	black --check --config pyproject.toml .

test:
	$(DOCKER_COMPOSE) run --rm $(BACKEND) pytest --disable-warnings