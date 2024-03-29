(function (){
  class e {
    static hasCamera() {
      return navigator.mediaDevices.enumerateDevices().then((a) => a.some((a) => "videoinput" === a.kind)).catch(() => !1);
    }
    constructor(a, c, b = e.DEFAULT_CANVAS_SIZE) {
      this.$video = a;
      this.$canvas = document.createElement("canvas");
      this._onDecode = c;
      this._paused = this._active = !1;
      this.$canvas.width = b;
      this.$canvas.height = b;
      this._sourceRect = {
        x: 0,
        y: 0,
        width: b,
        height: b
      };
      this._onCanPlay = this._onCanPlay.bind(this);
      this._onPlay = this._onPlay.bind(this);
      this._onVisibilityChange = this._onVisibilityChange.bind(this);
      this.$video.addEventListener("canplay", this._onCanPlay);
      this.$video.addEventListener("play", this._onPlay);
      document.addEventListener("visibilitychange", this._onVisibilityChange);
      this._qrWorker = new Worker(e.WORKER_PATH);
    }
    destroy() {
      this.$video.removeEventListener("canplay", this._onCanPlay);
      this.$video.removeEventListener("play", this._onPlay);
      document.removeEventListener("visibilitychange", this._onVisibilityChange);
      this.stop();
      this._qrWorker.postMessage({
        type: "close"
      });
    }
    start() {
      if (this._active && !this._paused) return Promise.resolve();
//      "https:" !== window.location.protocol && console.warn("The camera stream is only accessible if the page is transferred via https.");
      this._active = !0;
      this._paused = !1;
      if (document.hidden) return Promise.resolve();
      clearTimeout(this._offTimeout);
      this._offTimeout = null;
      if (this.$video.srcObject) return this.$video.play(), Promise.resolve();
      let a = "environment";
      return this._getCameraStream("environment", !0).catch(() => {
        a = "user";
        return this._getCameraStream();
      }).then((c) => {
        this.$video.srcObject = c;
        this._setVideoMirror(a);
      }).catch((a) => {
        this._active = !1;
        throw a;
      });
    }
    stop() {
      this.pause();
      this._active = !1;
    }
    pause() {
      this._paused = !0;
      this._active && (this.$video.pause(), this._offTimeout || (this._offTimeout = setTimeout(() => {
        let a = this.$video.srcObject && this.$video.srcObject.getTracks()[0];
        a && (a.stop(), this._offTimeout = this.$video.srcObject = null);
      }, 300)));
    }
    static scanImage(a, c = null, b = null, d = null, f = !1, g = !1) {
      let h = !1,
        l = new Promise((l, g) => {
          b || (b = new Worker(e.WORKER_PATH), h = !0, b.postMessage({
            type: "inversionMode",
            data: "both"
          }));
          let n, m, k;
          m = (a) => {
            "qrResult" ===
            a.data.type && (b.removeEventListener("message", m), b.removeEventListener("error", k), clearTimeout(n), null !== a.data.data ? l(a.data.data) : g("QR code not found."));
          };
          k = (a) => {
            b.removeEventListener("message", m);
            b.removeEventListener("error", k);
            clearTimeout(n);
            g("Scanner error: " + (a ? a.message || a : "Unknown Error"));
          };
          b.addEventListener("message", m);
          b.addEventListener("error", k);
          n = setTimeout(() => k("timeout"), 3E3);
          e._loadImage(a).then((a) => {
            a = e._getImageData(a, c, d, f);
            b.postMessage({
              type: "decode",
              data: a
            }, [a.data.buffer]);
          }).catch(k);
        });
      c && g && (l = l.catch(() => e.scanImage(a, null, b, d, f)));
      return l = l.finally(() => {
        h && b.postMessage({
          type: "close"
        });
      });
    }
    setGrayscaleWeights(a, c, b, d = !0) {
      this._qrWorker.postMessage({
        type: "grayscaleWeights",
        data: {
          red: a,
          green: c,
          blue: b,
          useIntegerApproximation: d
        }
      });
    }
    setInversionMode(a) {
      this._qrWorker.postMessage({
        type: "inversionMode",
        data: a
      });
    }
    _onCanPlay() {
      this._updateSourceRect();
      this.$video.play();
    }
    _onPlay() {
      this._updateSourceRect();
      this._scanFrame();
    }
    _onVisibilityChange() {
      document.hidden ? this.pause() : this._active &&
        this.start();
    }
    _updateSourceRect() {
      let a = Math.round(2 / 3 * Math.min(this.$video.videoWidth, this.$video.videoHeight));
      this._sourceRect.width = this._sourceRect.height = a;
      this._sourceRect.x = (this.$video.videoWidth - a) / 2;
      this._sourceRect.y = (this.$video.videoHeight - a) / 2;
    }
    _scanFrame() {
      if (!this._active || this.$video.paused || this.$video.ended) return !1;
      requestAnimationFrame(() => {
        e.scanImage(this.$video, this._sourceRect, this._qrWorker, this.$canvas, !0).then(this._onDecode, (a) => {
          this._active && "QR code not found." !== a &&
            console.error(a);
        }).then(() => this._scanFrame());
      });
    }
    _getCameraStream(a, c = !1) {
      let b = [{
        width: {
          min: 1024
        }
      }, {
        width: {
          min: 768
        }
      }, {}];
      a && (c && (a = {
        exact: a
      }), b.forEach((b) => b.facingMode = a));
      return this._getMatchingCameraStream(b);
    }
    _getMatchingCameraStream(a) {
      return 0 === a.length ? Promise.reject("Camera not found.") : navigator.mediaDevices.getUserMedia({
        video: a.shift()
      }).catch(() => this._getMatchingCameraStream(a));
    }
    _setVideoMirror(a) {
      this.$video.style.transform = "scaleX(" + ("user" === a ? -1 : 1) + ")";
    }
    static _getImageData(a, c =
      null, b = null, d = !1) {
      b = b || document.createElement("canvas");
      let f = c && c.x ? c.x : 0,
        g = c && c.y ? c.y : 0,
        h = c && c.width ? c.width : a.width || a.videoWidth;
      c = c && c.height ? c.height : a.height || a.videoHeight;
      d || b.width === h && b.height === c || (b.width = h, b.height = c);
      d = b.getContext("2d", {
        alpha: !1
      });
      d.imageSmoothingEnabled = !1;
      d.drawImage(a, f, g, h, c, 0, 0, b.width, b.height);
      return d.getImageData(0, 0, b.width, b.height);
    }
    static _loadImage(a) {
      if (a instanceof HTMLCanvasElement || a instanceof HTMLVideoElement || window.ImageBitmap && a instanceof window.ImageBitmap ||
        window.OffscreenCanvas && a instanceof window.OffscreenCanvas) return Promise.resolve(a);
      if (a instanceof Image) return e._awaitImageLoad(a).then(() => a);
      if (a instanceof File || a instanceof URL || "string" === typeof a) {
        let c = new Image;
        c.src = a instanceof File ? URL.createObjectURL(a) : a;
        return e._awaitImageLoad(c).then(() => {
          a instanceof File && URL.revokeObjectURL(c.src);
          return c;
        });
      }
      return Promise.reject("Unsupported image type.");
    }
    static _awaitImageLoad(a) {
      return new Promise((c, b) => {
        if (a.complete && 0 !== a.naturalWidth) c();
        else {
          let d, f;
          d = () => {
            a.removeEventListener("load", d);
            a.removeEventListener("error", f);
            c();
          };
          f = () => {
            a.removeEventListener("load", d);
            a.removeEventListener("error", f);
            b("Image load error");
          };
          a.addEventListener("load", d);
          a.addEventListener("error", f);
        }
      });
    }
  }
  QRSCANNER = e;
  QRSCANNER.DEFAULT_CANVAS_SIZE = 400;
  QRSCANNER.WORKER_PATH = "qr-scanner-worker.min.js";
  Export(QRSCANNER);
})();
//# sourceMappingURL=qr-scanner.min.js.map
