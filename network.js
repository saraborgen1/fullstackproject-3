//network.js
export class Network {
  constructor() {
    this.routes = [];
  }

  registerServer(prefix, serverInstance) {
    this.routes.push({ prefix, server: serverInstance });
  }

  send(request, callback) {
    if (!request || typeof request !== "object") {
      throw new Error("request must be an object");
    }
    if (typeof callback !== "function") {
      throw new Error("callback must be a function");
    }

    const { method, url, body, headers, requestId } = request;

    if (!method || !url) {
      callback({
        ok: false,
        error: { code: "INVALID_INPUT", message: "Missing method or url" },
        meta: requestId !== undefined ? { requestId } : {}
      });
      return;
    }

    const dropRate = 0.1;
    const delay = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;
    const dropped = Math.random() < dropRate;

    setTimeout(() => {
      // simulate drop: do nothing (FAJAX timeout should handle it)
      if (dropped) return;

      const route = this.routes.find(r => url.startsWith(r.prefix));
      if (!route) {
        callback({
          ok: false,
          error: { code: "BAD_ROUTE", message: "No server for this url" },
          meta: requestId !== undefined ? { requestId } : {}
        });
        return;
      }

      try {
        const server = route.server;     
        let serverRes;

        if (typeof server.handle !== "function") {
          callback({
            ok: false,
            error: { code: "SERVER_ERROR", message: "Server has no handle()" },
            meta: requestId !== undefined ? { requestId } : {}
          });
          return;
        }

        if (server.handle.length <= 1) {
          // TodosServer style
          serverRes = server.handle({
            method: String(method).toUpperCase(),
            url: String(url),
            body: body || {},
            headers: headers || {},
            requestId
          });
        } else {
          // AuthServer style
          serverRes = server.handle(
            String(method).toUpperCase(),
            String(url),
            body || {},
            headers || {}
          );
        }

        if (serverRes && typeof serverRes === "object" && "ok" in serverRes) {
          if (requestId !== undefined) {
            if (!serverRes.meta) serverRes.meta = {};
            if (serverRes.meta.requestId === undefined) serverRes.meta.requestId = requestId;
          }
          callback(serverRes);
          return;
        }
 
        if (serverRes && typeof serverRes === "object" && "status" in serverRes) {
          const status = Number(serverRes.status);
          const data = serverRes.data;

          if (status >= 200 && status < 300) {
            callback({
              ok: true,
              data: data,
              meta: requestId !== undefined ? { requestId } : {}
            });
          } else {
            callback({
              ok: false,
              error: {
                code: String(status || "ERROR"),
                message: (data && data.error) ? data.error : "Server error"
              },
              meta: requestId !== undefined ? { requestId } : {}
            });
          }
          return;
        }

        callback({
          ok: false,
          error: { code: "SERVER_ERROR", message: "Unknown server response format" },
          meta: requestId !== undefined ? { requestId } : {}
        });

      } catch (e) {
        callback({
          ok: false,
          error: { code: "SERVER_ERROR", message: e?.message || "Server crashed" },
          meta: requestId !== undefined ? { requestId } : {}
        });
      }
    }, delay);
  }
}
