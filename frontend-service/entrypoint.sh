#!/bin/sh
# Replace env vars in template and write config.json
envsubst < /usr/share/nginx/html/config.template.json > /usr/share/nginx/html/config.json

# Start nginx or your server to serve the React app
nginx -g 'daemon off;'
