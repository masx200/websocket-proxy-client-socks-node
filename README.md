# websocket-proxy-client-socks-node

#### 介绍

websocket-proxy-client-socks-node

#### 软件架构

软件架构说明

websocket-proxy-deno-deploy的socks客户端

运行

```
node ./cli.js
```

配置文件`config.json`

```json
{
  //服务端websocket的url链接
  "server_url": "ws://localhost:8000",
  //本地socks服务器的端口
  "sport": 1080,
  //本地socks服务器的地址
  "sbind": "0.0.0.0"
}
```
