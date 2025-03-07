
#!/bin/sh
cd /app/api && node index.js &
nginx -g "daemon off;"
