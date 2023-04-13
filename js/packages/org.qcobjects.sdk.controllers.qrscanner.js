/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
"use strict";

Package("org.qcobjects.sdk.controllers.qrscanner",[
  Class("QRScanController",Controller,{
    dependencies:[],
    component:null,
    scanner:null,
    loadDependencies(callback){
      var controller = this;
      if (controller.dependencies.length>0){
        callback.call(controller);
      } else {
        var QRScannerPath = CONFIG.get("qr-scanner-path","./js/packages/thirdparty/libs/qr-scanner/");

        controller.dependencies.push(New(SourceJS,{
        url:QRScannerPath+"qr-scanner-worker.min.js",
        external:CONFIG.get("qr-scanner-external",false),
          done: function (){
            controller.dependencies.push(New(SourceJS,{
              url:QRScannerPath+"qr-scanner.min.js",
              external:CONFIG.get("qr-scanner-external",false),
              done: function (){callback.call(controller);}
            }));

          }
        }));

      }
    },
    __result_notified__:false,
    setResult(label, result) {
      const controller = this;
      var isURL = function (u){
        return (function (u){var _ret_;try {u=new URL(u);_ret_=true;} catch (e){_ret_=false;}return _ret_;})(u);
      };
      if (!controller.__result_notified__){
        const camQrResultTimestamp = controller.component.shadowRoot.subelements("#cam-qr-result-timestamp").pop();
        const videoBox = controller.component.shadowRoot.subelements(".qr-video-box").pop();

        label.textContent = result;

        let clipboard = function (content){
          var clipboard_content = New(Component,{
            name:"clipboard",
            templateURI:"",
            body:document.createElement("input"),
            tplsource:"none"
          });
          clipboard_content.attachIn("body");
          clipboard_content.body.defaultValue = content;
          clipboard_content.body.select();
          document.execCommand("copy");
          document.body.removeChild(clipboard_content.body);
        };

        clipboard(result);
        videoBox.classList.remove("box-color-change-5x");

        NotificationComponent.success(result);
        setTimeout(function () {
          NotificationComponent.success("Copied to clipboard!");
        }, 1500);
        
        camQrResultTimestamp.textContent = new Date().toString();
        label.style.color = "teal";
        clearTimeout(label.highlightTimeout);
        label.highlightTimeout = setTimeout(() => label.style.color = "inherit", 100);
        if (isURL(result)){
          location.href=result;
        }
        controller.showControls();
        controller.__result_notified__ = true;
      }
    },
    showControls () {
      var controller = this;
      let componentRoot = controller.component.shadowRoot.host;
      let elementList = controller.component.shadowRoot.subelements(".controls");
      let videoBox = controller.component.shadowRoot.subelements(".qr-video-box");
      if (typeof this.__show_controls__ === "undefined") {
        this.__show_controls__ = New(Toggle);
        this.__show_controls__._new_({
          negative ({elementList, videoBox, effect}) {
            NotificationComponent.info("Loading QR scanner...");
            controller.__result_notified__ = false;
            componentRoot.style.background = "none";
            componentRoot.style.minHeight = "";
            elementList.map(e=>effect.apply(e, 1, 0));
            videoBox.map(e=>{effect.apply(e, 0, 1);e.classList.add("box-color-change-5x");});
            controller.scanner.start();
            global.get("footerComponent").shadowRoot.subelements(".showControlsSwitch").map(e=>e.textContent = "Stop Scanning");
          },
          positive ({elementList, videoBox, effect}) {
            NotificationComponent.info("Stoping QR scanner...");
            controller.__result_notified__ = true;
            componentRoot.style.background = "#111";
            componentRoot.style.minHeight = "1000px";
            elementList.map(e=>effect.apply(e, 0, 1));
            controller.scanner.stop();
            videoBox.map(e=>{effect.apply(e, 1, 0);e.classList.remove("box-color-change-5x");});            
            global.get("footerComponent").shadowRoot.subelements(".showControlsSwitch").map(e=>e.textContent = "Start Scanning");
          },
          args: {elementList: elementList, videoBox: videoBox, effect: new Fade()}

        });
      }
      return this.__show_controls__.fire();
    },
    done (){
      var controller = this;
      global.set("qrControllerInstance", controller);


      let qrscanner_load = function () {
          var QRScannerPath = CONFIG.get("qr-scanner-path","./js/packages/thirdparty/libs/qr-scanner/");
          QRSCANNER.WORKER_PATH = QRScannerPath+"qr-scanner-worker.min.js";

          const video = controller.component.shadowRoot.subelements("#qr-video").pop();
          const camHasCamera = controller.component.shadowRoot.subelements("#cam-has-camera").pop();
          const camQrResult = controller.component.shadowRoot.subelements("#cam-qr-result").pop();
          const fileSelector = controller.component.shadowRoot.subelements("#file-selector").pop();
          const fileQrResult = controller.component.shadowRoot.subelements("#file-qr-result").pop();


          // ####### Web Cam Scanning #######

          NotificationComponent.info("Loading camera...");
          QRSCANNER.hasCamera().then(hasCamera => {
            camHasCamera.textContent = hasCamera;
            if (hasCamera){
              NotificationComponent.success("Camera is available!");
            } else {
              NotificationComponent.warning("Camera is NOT available!");
            }
          });

          controller.scanner = new QRSCANNER(video, result => controller.setResult(camQrResult, result));
          controller.showControls();

          controller.component.shadowRoot.subelements("#inversion-mode-select").pop().addEventListener("change", event => {
              controller.scanner.setInversionMode(event.target.value);
          });

          // ####### File Scanning #######

          fileSelector.addEventListener("change", event => {
              const file = fileSelector.files[0];
              if (!file) {
                  return;
              }
              QRSCANNER.scanImage(file)
                  .then(result => setResult(fileQrResult, result))
                  .catch(e => setResult(fileQrResult, e || "No QR code found."));
          });

      };

      controller.loadDependencies(
        function (){
          qrscanner_load();
        });


    }
  })
]);
