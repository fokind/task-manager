sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/ui/model/odata/v4/Context"],
    function (Controller) {
        "use strict";

        return Controller.extend("fokind.kanban.controller.ProjectEdit", {
            onInit: function () {
                var oComponent = this.getOwnerComponent();
                oComponent
                    .getRouter()
                    .getRoute("projectEdit")
                    .attachMatched(this._onRouteMatched, this);
                this.getView().addStyleClass(
                    oComponent.getContentDensityClass()
                );
            },

            _onRouteMatched: function (oEvent) {
                var oView = this.getView();
                var sId = oEvent.getParameter("arguments").id;
                var sPath = "/Projects('" + sId + "')";

                oView.bindObject({
                    path: sPath,
                });

                var oContextBinding = oView.getModel().bindContext(sPath);

                oContextBinding.requestObject().then(function () {
                    var oContext = oContextBinding.getBoundContext();
                    oView.getModel("draft").setData({
                        title: oContext.getProperty("title"),
                    });
                });
            },

            _draftToJSON: function () {
                var oDraftModel = this.getView().getModel("draft");
                return JSON.stringify({
                    title: oDraftModel.getProperty("/title"),
                });
            },

            onSavePress: function () {
                var oView = this.getView();
                var sPath = oView.getBindingContext().getPath();

                $.ajax({
                    async: true,
                    url: "/odata" + sPath, // TODO получать путь из модели
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    data: this._draftToJSON(),
                }).then(function() {
                    oView.getModel().refresh();
                });
            },

            onBackPress: function () {
                this.getOwnerComponent().getRouter().navTo("projects");
            },
        });
    }
);
