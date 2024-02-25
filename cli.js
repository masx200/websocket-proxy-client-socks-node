#!/usr/bin/env node
/* https://github.com/imTheSabrali/CF-Worker-Socks */
const cpath = "./config.json";
const fs = require("fs");
const net = require("net");
const { WebSocket, createWebSocketStream } = require("ws");
const logcb = (...args) => console.log.bind(this, ...args);
const errcb = (...args) => console.error.bind(this, ...args);

async function socks(config) {
  const { server_url, sport = 1080, sbind = "127.0.0.1" } = config;
  const url = server_url;
  net
    .createServer((socks) =>
      socks
        .once("data", (data) => {
          const [VERSION] = data;
          if (VERSION != 0x05) socks.end();
          else if (data.slice(2).some((method) => method == 0x00)) {
            socks.write(Buffer.from([0x05, 0x00]));
            socks.once("data", (head) => {
              const [VERSION, CMD, RSV, ATYP] = head;
              if (RSV != 0x00) return socks.end();
              if (VERSION != 0x05 || CMD != 0x01) return;
              const host = ATYP == 0x01
                ? head
                  .slice(4, -2)
                  .map((b) => parseInt(b, 10))
                  .join(".")
                : ATYP == 0x04
                ? head
                  .slice(4, -2)
                  .reduce(
                    (s, b, i, a) => i % 2 ? s.concat(a.slice(i - 1, i + 1)) : s,
                    [],
                  )
                  .map((b) => b.readUInt16BE(0).toString(16))
                  .join(":")
                : ATYP == 0x03
                ? head.slice(5, -2).toString("utf8")
                : "";
              const port = head.slice(-2).readUInt16BE(0);

              new Promise((res, rej) => {
                {
                  const headers = {
                    "X-Destination-Address": host,
                    "X-Destination-Port": port,
                    "x-Protocol": "CONNECT",
                  };
                  const opts = {
                    headers: headers,
                  };
                  /*
支持基本身份验证,用户名和密码 */
                  if (
                    config["server_username"] != null &&
                    config["server_password"]
                  ) {
                    headers["Authorization"] = "Basic " +
                      btoa(
                        config["server_username"] +
                          ":" +
                          config["server_password"],
                      );
                  }
                  console.log(opts);
                  new WebSocket(url, opts)
                    .on("open", function (e) {
                      res(createWebSocketStream(this));
                    })
                    .on("error", (e) => rej(e));
                }
              })
                .then((s) => {
                  socks.write(((head[1] = 0x00), head));
                  logcb("conn:")({ host, port });
                  socks
                    .pipe(s)
                    .on("error", (e) => errcb("E1:")(e.message))
                    .pipe(socks)
                    .on("error", (e) => errcb("E2:")(e.message));
                })
                .catch((e) => {
                  console.error(e);
                  errcb("connect-catch:")(e.message);
                  socks.end(((head[1] = 0x03), head));
                });
            });
          } else socks.write(Buffer.from([0x05, 0xff]));
        })
        .on("error", (e) => errcb("socks-err:")(e.message))
    )
    .listen(sport, sbind, logcb(`server start on: ${sbind}:${sport}`))
    .on("error", (e) => errcb("socks5-err")(e.message));
}
fs.exists(cpath, (e) => {
  if (e) socks(JSON.parse(fs.readFileSync(cpath)));
  else console.error("当前程序的目录没有config.json文件!");
});
