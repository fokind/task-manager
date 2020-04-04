sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("fokind.kanban.controller.Kanban", {
        onInit: function () {
            var oComponent = this.getOwnerComponent();
            oComponent
                .getRouter()
                .getRoute("kanban")
                .attachMatched(this._onRouteMatched, this);
            this.getView().addStyleClass(oComponent.getContentDensityClass());
        },

        _onRouteMatched: function (oEvent) {
            var oView = this.getView();
            var sId = oEvent.getParameter("arguments").id;
            oView.bindElement({
                path: "/Projects('" + sId + "')",
                parameters: {
                    $expand: "States($expand=Tasks)",
                },
            });
        },

        onEditPress: function () {
            var sId = this.getView().getBindingContext().getProperty("_id");
            this.getOwnerComponent().getRouter().navTo("projectEdit", {
                id: sId,
            });
        },

        onAddPress: function () {
            // var sProjectId = this.getView().getBindingContext().getProperty("_id");
            // var oList = this.byId("tasks");
            // var oBinding = oList.getBinding("items");
            // var oContext = oBinding.create({
            //     title: "Task",
            //     projectId: sProjectId
            // });
            // oContext.created().then(function() {
            //     oContext.getModel().refresh();
            // });
        },

        onBackPress: function () {
            this.getOwnerComponent().getRouter().navTo("projects");
        },
    });
});
