#!/bin/sh
set -e
envsubst < /usr/share/nginx/html/config.template.json > /usr/share/nginx/html/config.json
exec nginx -g 'daemon off;'
