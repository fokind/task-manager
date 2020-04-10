sap.ui.define([], function () {
    "use strict";

    return {
        ajaxPromise: function (sMethod, sPath, oData) {
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
    };
});
