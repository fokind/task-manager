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

        _setTaskStatePromise: function (sTaskId, sStateId) {
            return $.ajax({
                async: true,
                url: "/odata/Tasks('" + sTaskId + "')", // TODO получать путь из модели
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                data: JSON.stringify({
                    stateId: sStateId,
                }),
            });
        },

        onDrop: function (oEvent) {
            var sTaskId = oEvent
                .getParameter("draggedControl")
                .getBindingContext()
                .getProperty("_id");

            var sDropPosition = oEvent.getParameter("dropPosition");

            var sStateId = oEvent
                .getParameter("droppedControl")
                .getBindingContext()
                .getProperty(sDropPosition === "On" ? "_id" : "stateId");

            this._setTaskStatePromise(sTaskId, sStateId).then(
                function () {
                    this.getView().getModel().refresh();
                }.bind(this)
            );
        },

        onBackPress: function () {
            this.getOwnerComponent().getRouter().navTo("projects");
        },
    });
});
