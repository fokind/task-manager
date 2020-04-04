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
                var oContextBinding = oView
                    .getModel()
                    .bindContext("/Projects('" + sId + "')");

                oContextBinding.requestObject().then(function () {
                    var oContext = oContextBinding.getBoundContext();
                    oView.getModel("draft").setData({
                        title: oContext.getProperty("title"),
                    });
                });
            },

            onSavePress: function () {
                // модель draft сохранить в odata
            },

            onBackPress: function () {
                this.getOwnerComponent().getRouter().navTo("projects");
            },
        });
    }
);
