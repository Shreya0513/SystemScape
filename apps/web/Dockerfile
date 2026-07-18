FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_REDIS_LAB_URL
ARG NEXT_PUBLIC_RATE_LIMITER_URL
ARG NEXT_PUBLIC_LOAD_BALANCER_URL
ENV NEXT_PUBLIC_REDIS_LAB_URL=$NEXT_PUBLIC_REDIS_LAB_URL
ENV NEXT_PUBLIC_RATE_LIMITER_URL=$NEXT_PUBLIC_RATE_LIMITER_URL
ENV NEXT_PUBLIC_LOAD_BALANCER_URL=$NEXT_PUBLIC_LOAD_BALANCER_URL

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
