sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("fokind.kanban.controller.Projects", {
        onInit: function () {
            var oComponent = this.getOwnerComponent();
            this.getView().addStyleClass(oComponent.getContentDensityClass());
        },

        onAddPress: function () {
            var oList = this.byId("projects");
            var oBinding = oList.getBinding("items");
            var oContext = oBinding.create({
                title: "Project",
            });
        },

        onItemPress: function (oEvent) {
            this.getOwnerComponent()
                .getRouter()
                .navTo("projectEdit", {
                    id: oEvent
                        .getSource()
                        .getBindingContext()
                        .getProperty("_id"),
                });
        },
    });
});
