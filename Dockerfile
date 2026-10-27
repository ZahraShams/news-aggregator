# ---- Build: install, test and build the app ----
FROM node:26-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm test && npm run build

# ---- Serve: static files with nginx ----
FROM nginx:1.29-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
# Scripts in /docker-entrypoint.d run before nginx starts.
COPY --chmod=755 docker/entrypoint.sh /docker-entrypoint.d/40-write-config.sh
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
