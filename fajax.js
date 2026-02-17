// fajax.js

export class FXMLHttpRequest {

  constructor(network) {
    this.network = network;
    this.method = null;
    this.url = null;
    this.headers = {};
    this.body = null;
    this.readyState = 0;   
    this.status = 0;
    this.response = null;
    this.timeout = 4000;   
    this.onreadystatechange = null;
    this._timeoutId = null;
  }

  open(method, url) {
    this.method = method;
    this.url = url;
    this.readyState = 1; 

    if (this.onreadystatechange) {
      this.onreadystatechange();
    }
  }

  setRequestHeader(key, value) {
    this.headers[key] = value;
  }

  send(body = null) {
    this.body = body;
    this.readyState = 2; 

    if (this.onreadystatechange) {
      this.onreadystatechange();
    }

    const requestId = Date.now() + Math.random();

    this._timeoutId = setTimeout(() => {
      this.readyState = 4;
      this.status = 0;
      this.response = {
        ok: false,
        error: { code: "TIMEOUT", message: "Request timeout" }
      };

      if (this.onreadystatechange) {
        this.onreadystatechange();
      }

    }, this.timeout);

    this.network.send(
      {
        method: this.method,
        url: this.url,
        headers: this.headers,
        body: this.body,
        requestId: requestId
      },
      (response) => {

        if (this.readyState === 4 && this.status === 0) {
          return;
        }

        clearTimeout(this._timeoutId);

        this.readyState = 4;
        this.status = response.ok ? 200 : 404;
        this.response = response;

        if (this.onreadystatechange) {
          this.onreadystatechange();
        }
      }
    );
  }
}
