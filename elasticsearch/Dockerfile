FROM elasticsearch:8.11.3

COPY --chown=elasticsearch:elasticsearch elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml
ENV discovery.type=single-node

EXPOSE 9200