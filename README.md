# websocket-proxy-client-socks-node

#### 介绍

websocket-proxy-client-socks-node

支持基本身份验证,用户名和密码

#### 软件架构

软件架构说明

websocket-proxy-deno-deploy 的 socks 客户端

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
  //远程服务器的用户名,可以为null
  "server_username": "hello",
  //远程服务器的用户名,可以为null
  "server_password": "world",
  //本地socks服务器的地址
  "sbind": "0.0.0.0"
}
```
