sap.ui.define(["sap/ui/core/mvc/Controller"], function(Controller) {
    "use strict";

    return Controller.extend("fokind.kanban.controller.Project", {
        onInit: function() {
            var oComponent = this.getOwnerComponent();
            oComponent
                .getRouter()
                .getRoute("project")
                .attachMatched(this._onRouteMatched, this);
            this.getView().addStyleClass(oComponent.getContentDensityClass());
        },

        _onRouteMatched: function(oEvent) {
            var oView = this.getView();
            var sId = oEvent.getParameter("arguments").id;
            oView.bindElement({
                path: "/Project('" + sId + "')"
            });
        },

        onBackPress: function() {
            this.getOwnerComponent()
                .getRouter()
                .navTo("projects");
        }
    });
});
