FROM mongo:7.0-rc

COPY mondo_setup.js /docker-entrypoint-initdb.d/

ENV MONGO_INITDB_ROOT_USERNAME root
ENV MONGO_INITDB_ROOT_PASSWORD root
ENV MONGO_INITDB_DATABASE studiconnect

EXPOSE 27017

CMD ["mongod"]