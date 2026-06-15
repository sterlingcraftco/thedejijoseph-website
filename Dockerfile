# Build stage for frontend (Astro static SSG)
FROM node:22-alpine AS build-frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# NOTE: `astro build` fetches all posts from the Ghost Content API at build time
# (getStaticPaths in src/pages/notes/[slug].astro). This stage therefore needs
# network access to https://notes.thedejijoseph.com. If Ghost is unreachable the
# build fails by design rather than shipping an empty blog.
RUN npm run build

# Build stage for backend (preparing node_modules)
FROM node:22-alpine AS build-backend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY server/ ./server/
COPY tsconfig.json ./

# Final stage
FROM node:22-alpine
RUN apk add --no-cache caddy

WORKDIR /app

# Copy frontend build
COPY --from=build-frontend /app/dist /usr/share/caddy

# Copy backend and dependencies
COPY --from=build-backend /app/node_modules ./node_modules
COPY --from=build-backend /app/package.json ./package.json
COPY server/ ./server/
COPY Caddyfile /etc/caddy/Caddyfile
COPY start.sh /start.sh

RUN chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]
