FROM node:14-alpine AS BUILDER

RUN apk update && \
    apk add --no-cache git

COPY wait /wait

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm i --only=production

# Production stage
FROM node:14-alpine

WORKDIR /app

COPY --from=BUILDER /wait /
COPY --from=BUILDER /app/ .
COPY static/ static/
COPY views/ views/
COPY config/ config/
COPY runner.js runner.js
COPY app.js app.js
COPY lib/ lib/

CMD /wait && npm start
