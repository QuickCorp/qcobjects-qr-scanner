'use strict';
Package('org.qcobjects.cloud.auth.session.usertoken',[
  Class ("SessionUserToken",Object, {
    user: {},
    __cache__: null,
    _new_ (o) {
      var __instance__ = this;
      this.__cache__ = new ComplexStorageCache(
        {
          index: __instance__.__instanceID.toString(),
          load (cacheController) {
            __instance__.user = {
                    priority:__instance__.__instanceID.toString(),
                    token: _Crypt.encrypt(`${navigator.userAgent}|${o.username}|${(+(new Date())).toString()}`,origin)
                  };
            return __instance__.user;
          },
          alternate (cacheController) {
            __instance__.user = cacheController.cache.getCached(__instance__.__instanceID.toString()); // setting dataObject with the cached value
            return;
          }
        });
    },
    getGlobalUser() {
      var username = [...arguments].join("|");
      var __index__ = "userToken_"+btoa(username);
      if (typeof global.get(__index__) === "undefined" || global.get(__index__) === null){
        global.set(__index__, New(SessionUserToken, {
          username: username
        }));
      }
      SessionUserToken.user = global.get(__index__).user;
      return global.get(__index__).user;
    },
    getGlobalUserToken () {
      return this.getGlobalUser(...arguments).token;
    },
    getGlobalUserId () {
      return this.getGlobalUser(...arguments).id;
    },
    getGlobalUserPriority () {
      return this.getGlobalUser(...arguments).priority;
    },
    getLoginCredentialsToken (username, password) {
      return _Crypt.encrypt(`${username}${password}`, this.getGlobalUserToken(username));
    },
    closeGlobalSession () {
      this.getGlobalUser(...arguments);
      var username = [...arguments].join("|");
      var __index__ = "userToken_"+btoa(username);
      if (typeof global.get(__index__) !== "undefined"){
        global.get(__index__).__cache__.clear();
        global.set(__index__, null);
        SessionUserToken.user = {};
      }
    }
  })
]);
