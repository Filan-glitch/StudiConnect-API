FROM nginx:1.25.3-alpine3.18

COPY ./nginx.conf /etc/nginx/nginx.conf
RUN rm -rf /etc/nginx/conf.d/default.conf
EXPOSE 80
