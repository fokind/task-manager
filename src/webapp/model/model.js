sap.ui.define([], function () {
    "use strict";

    return {
        _ajaxPromise: function (sMethod, sPath, oData) {
            return new Promise(function (resolve, reject) {
                var oOptions = {
                    async: true,
                    url: "/odata" + sPath, // TODO получать путь из модели
                    method: sMethod,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    success: resolve,
                    error: reject,
                };

                if (oData) {
                    oOptions.data = JSON.stringify(oData);
                }

                $.ajax(oOptions);
            });
        },

        createPromise: function (sPath, oData) {
            return this._ajaxPromise("POST", sPath, oData);
        },

        updatePromise: function (sPath, oData) {
            return this._ajaxPromise("PATCH", sPath, oData);
        },

        deletePromise: function (sPath) {
            return this._ajaxPromise("DELETE", sPath);
        },
    };
});
