#!/bin/sh

cd ../proxy
docker build -t studiconnect-proxy:latest .
cd - > /dev/null

cd ../web
docker build -t studiconnect-web:latest .
cd - > /dev/null

cd ..
docker build -t studiconnect-backend:latest .
cd - > /dev/null

cd ../elasticsearch
docker build -t studiconnect-elasticsearch:latest .
cd - > /dev/null