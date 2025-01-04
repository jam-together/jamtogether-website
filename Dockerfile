FROM node:20.16.0-alpine AS tmp

WORKDIR /app

COPY package*.json .

RUN npm install && rm -rf /tmp/*

COPY . .

ENV NODE_ENV=production

RUN npm run build

FROM nginx:stable-alpine

COPY --from=tmp /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]