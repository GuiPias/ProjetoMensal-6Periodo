FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Padrão /api: o React chama a API no mesmo endereço do site e o Nginx repassa para o
# backend (usado no Kubernetes). O docker-compose da EC2 sobrescreve com o IP da instância.
# Evite passar VITE_API_URL=/api pela linha de comando no Git Bash do Windows: o MSYS
# converte "/api" para um caminho de arquivo (ex. C:/Program Files/Git/api) e quebra o build.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
