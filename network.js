// network.js

export class Network {
  constructor() {
    this.routes = []; 
  }

// Registers a server instance to handle requests for a specific URL prefix
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
        meta: requestId ? { requestId } : {}
      });
      return;
    }

    const dropRate = Math.random() * (0.5 - 0.1) + 0.1;
    const delay = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;
    const dropped = Math.random() < dropRate;

    setTimeout(() => {
        
      if (dropped) {
        return;
      }

      const route = this.routes.find(r => url.startsWith(r.prefix));

      if (!route) {
        callback({
          ok: false,
          error: { code: "BAD_ROUTE", message: "No server for this url" },
          meta: requestId ? { requestId } : {}
        });
        return;
      }

      try {
        const response = route.server.handle(
          method.toUpperCase(),
          url,
          body,
          headers || {}
        );

        callback(response);

      } catch (e) {
        callback({
          ok: false,
          error: { code: "SERVER_ERROR", message: "Server crashed" },
          meta: requestId ? { requestId } : {}
        });
      }

    }, delay);
  }
}
