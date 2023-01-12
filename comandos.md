pm2 start server.js --name="server1" --watch -- 8080
pm2 start server.js --name="server2" --watch -i max -- 8081