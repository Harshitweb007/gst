FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:5001
ARG VITE_PAYMENT_URL=http://localhost:4000
ARG VITE_RAZORPAY_KEY_ID=rzp_test_RmbMCiiHISeIHG

ENV VITE_API_URL=$VITE_API_URL \
    VITE_PAYMENT_URL=$VITE_PAYMENT_URL \
    VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID

RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
