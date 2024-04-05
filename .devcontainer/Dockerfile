
FROM nginx

WORKDIR /workspaces/Spatial-Audio-Web

EXPOSE 80

COPY nginx/default.conf /etc/nginx/conf.d
COPY html/ ./html/
COPY package.json ./
COPY package-lock.json ./
