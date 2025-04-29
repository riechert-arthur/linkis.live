# Runs a development container for Go with hot-reload.

FROM golang:alpine 

LABEL org.opencontainers.image.authors="riechertarthur@gmail.com"

WORKDIR /service

ARG REST_PATH=/services/rest

RUN go install github.com/air-verse/air@latest

COPY $REST_PATH/go.mod \
     $REST_PATH/go.sum ./ 

RUN go mod download

CMD ["air", "-c", ".air.toml"]
