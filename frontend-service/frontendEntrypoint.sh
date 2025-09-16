#!/bin/sh
envsubst < /usr/share/nginx/html/config.template.json > /usr/share/nginx/html/config.json

nginx -g 'daemon off;'
