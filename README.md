<!-- TODO: Update name -->
# linkis.live - URL Shortener Written in Go

## Description

![Linkis.live logo](/assets/images/hero.png)

<!-- A short description to explain the what, why and how. -->

Linkis.live is an open-source, easy-to-deploy URL shortener with support for custom social media previews. It provides a free alternativeto paid link-shortening services and is designed to be simple for non-programmers to deploy. 

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Contribution](#contribution)
- [Tests](#tests)

## Installation

### Requirements

1. Docker and Docker Compose

2. Docker Desktop (Windows and MacOS)

### Steps

1. Clone the repo using your desired method and open your terminal in the downloaded folder.

    ```
    git clone https://github.com/riechert-arthur/linkis.live.git
    cd linkis.live
    ```

2. Ensure the docker daemon is running if you are on Linux. Verify that there is Client and Server information print into the console.

    ```
    docker info
    ```

3. If you are on Windows or MacOS, make sure Docker Desktop is currently open.

4. Ensure you are in the root folder with the `docker-compose.yml` file, and start compose. This process   will take a few minutes to pull the images and start each container.
    
    ```
    docker-compose up
    ```

5. After all the containers have started, you can go to the frontend application at `http://localhost:5173/`.

6. If you want to directly call the API endpoints from `http://localhost:8080`. View the `services/rest/internal/handler/url_mapping.go` and `services/rest/cmd/server/main.go` for more information on how to call them.

    ```
    # Create (or overwrite) a short‑link mapping
    curl -X POST http://localhost:8080/api/add_url_mapping \
      -H "Content-Type: application/json" \
      -d '{
            "short": "example",            # slug you want people to type
            "long":  "https://example.com" # where it should redirect
          }'
    ```

    Visit `http://localhost:8080/example` to retrieve the mapping.

## Usage

The app currently has a basic workflow that includes registering the URL mapping, storing it in Redis, and redirecting the user to their desired page when using the slug. It does not currently include custom social media previews.

[![Linkis.live Demo](https://img.youtube.com/vi/O-YTYqgp6dA/0.jpg)](https://www.youtube.com/watch?v=O-YTYqgp6dA)

## Contribution

Coming soon...

<!-- TODO: Explain how to contribute to project. -->

## Tests

### Client

Tests for the client run automatically on each reload when you run docker-compose. The recommended method for testing is docker-compose.

If you would like to test outside of docker-compose, there are a few extra steps required. Running tests locally requires you to delete some folders that were attached to docker volumes during build time.

#### Steps

1. Open your terminal in `/path/to/client/`

2. `rm -rf node_modules/ .react-router/`

3. Run `npm install`

4. Start the tests using `npm test`

### Server

Running tests for the Go REST server is a little simpler. These tests are **not** run automatically on each reload in docker-compose.

For the rest service, follow the below steps.

#### Steps

1. Open your terminal in `/path/to/services/rest`

2. Run `go test ./...`
