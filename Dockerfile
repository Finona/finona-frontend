FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

RUN addgroup -g 1001 -S nodejs && \
    adduser -S finona -u 1001

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

RUN chown -R finona:nodejs /usr/share/nginx/html && \
    chown -R finona:nodejs /var/cache/nginx && \
    chown -R finona:nodejs /var/log/nginx && \
    chown -R finona:nodejs /etc/nginx/conf.d && \
    mkdir -p /var/run/nginx && \
    chown -R finona:nodejs /var/run/nginx

USER finona

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
