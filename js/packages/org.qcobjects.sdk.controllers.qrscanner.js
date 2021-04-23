'use strict';

Package('org.qcobjects.sdk.controllers.qrscanner',[
  Class('QRScanController',Object,{
    dependencies:[],
    component:null,
    loadDependencies(callback){
      var controller = this;
      if (controller.dependencies.length>0){
        callback.call(controller);
      } else {
        var QRScannerPath = CONFIG.get('qr-scanner-path','./js/packages/thirdparty/libs/qr-scanner/');
        controller.dependencies.push(New(SourceJS,{
  				url:QRScannerPath+'qr-scanner-worker.min.js',
  				external:CONFIG.get('qr-scanner-external',false),
          done: function (){
            controller.dependencies.push(New(SourceJS,{
              url:QRScannerPath+'qr-scanner.min.js',
              external:CONFIG.get('qr-scanner-external',false),
              done: function (){callback.call(controller);}
            }));

          }
  			}));

      }
    },
    setResult(label, result) {
        const controller = this;
        const camQrResultTimestamp = controller.component.shadowRoot.subelements('#cam-qr-result-timestamp').pop();

        label.textContent = result;
        camQrResultTimestamp.textContent = new Date().toString();
        label.style.color = 'teal';
        clearTimeout(label.highlightTimeout);
        label.highlightTimeout = setTimeout(() => label.style.color = 'inherit', 100);
        location.href=result;
    },
    showControls () {
      let elementList = Tag("component[name=qrscancode] .shadowHost").pop().shadowRoot.subelements("*:not(video)");
      if (typeof this.__show_controls__ === "undefined") {
        this.__show_controls__ = New(Toggle, {
          positive ({elementList, effect}) {
            elementList.map(e=>effect.apply(e, 1, 0));
            Tag(".showControlsSwitch").map(e=>e.textContent = "Show Controls");
          },
          negative ({elementList, effect}) {
            elementList.map(e=>effect.apply(e, 0, 1))
            Tag(".showControlsSwitch").map(e=>e.textContent = "Hide Controls");
          },
          args: {elementList: elementList, effect: Fade}

        });
      }
      return this.__show_controls__.fire();
    },
    done (){
      var controller = this;
      global.set("qrControllerInstance", controller);

      let qrscanner_load = function () {


          var QRScannerPath = CONFIG.get('qr-scanner-path','./js/packages/thirdparty/libs/qr-scanner/');

          QRSCANNER.WORKER_PATH = QRScannerPath+'qr-scanner-worker.min.js';

          const video = controller.component.shadowRoot.subelements('#qr-video').pop();
          const camHasCamera = controller.component.shadowRoot.subelements('#cam-has-camera').pop();
          const camQrResult = controller.component.shadowRoot.subelements('#cam-qr-result').pop();
          const fileSelector = controller.component.shadowRoot.subelements('#file-selector').pop();
          const fileQrResult = controller.component.shadowRoot.subelements('#file-qr-result').pop();


          // ####### Web Cam Scanning #######

          QRSCANNER.hasCamera().then(hasCamera => camHasCamera.textContent = hasCamera);

          const scanner = new QRSCANNER(video, result => controller.setResult(camQrResult, result));
          scanner.start();

          controller.component.shadowRoot.subelements('#inversion-mode-select').pop().addEventListener('change', event => {
              scanner.setInversionMode(event.target.value);
          });

          // ####### File Scanning #######

          fileSelector.addEventListener('change', event => {
              const file = fileSelector.files[0];
              if (!file) {
                  return;
              }
              QRSCANNER.scanImage(file)
                  .then(result => setResult(fileQrResult, result))
                  .catch(e => setResult(fileQrResult, e || 'No QR code found.'));
          });

      }

      controller.loadDependencies(
        function (){
          qrscanner_load()
        });


    }
  })
]);
