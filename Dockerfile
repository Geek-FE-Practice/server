FROM node:16.16.0 AS builder
COPY . /server/
WORKDIR /server
RUN npm config set registry https://registry.npmmirror.com && \
    npm install && \
    npm run build

FROM node:16-alpine AS production
COPY --from=builder /server/package.json /server/package.json
COPY --from=builder /server/package-lock.json /server/package-lock.json
COPY --from=builder /server/dist /server/dist
WORKDIR /server
RUN npm config set registry https://registry.npmmirror.com && \
    npm install --production

CMD ["node", "dist/index.js"]

EXPOSE 8000
