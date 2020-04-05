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
            var sPath = "/Projects('" + sId + "')";
            oView.bindObject({
                path: sPath,
                parameters: {
                    $expand: "States($expand=Tasks)",
                },
            });

            var oContext = oView.getBindingContext();
            var oModel = oView.getModel();
            var oStatesBinding = oModel.bindList("States", oContext);
            oContext.requestObject().then(function () {
                var oDraft = {
                    States: oStatesBinding
                        .getContexts()
                        .map(function (oStateContext) {
                            return {
                                _id: oStateContext.getProperty("_id"),
                                title: oStateContext.getProperty("title"),
                                Tasks: oModel
                                    .bindList("Tasks", oStateContext)
                                    .getContexts()
                                    .map(function (oTaskContext) {
                                        return {
                                            _id: oTaskContext.getProperty(
                                                "_id"
                                            ),
                                            title: oTaskContext.getProperty(
                                                "title"
                                            ),
                                        };
                                    }),
                            };
                        }),
                };

                oView.getModel("draft").setData(oDraft);
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
            var oDraggedItem = oEvent
                .getParameter("draggedControl")
                .getBindingContext("draft")
                .getObject();

            // удалить из исходного
            var oDraggedList = oEvent
                .getParameter("draggedControl")
                .getParent()
                .getBindingContext("draft")
                .getProperty("Tasks");
            var iDraggedIndex = oDraggedList.indexOf(oDraggedItem);
            oDraggedList.splice(iDraggedIndex, 1);

            // добавить в целевой
            var sDropPosition = oEvent.getParameter("dropPosition");

            if (sDropPosition === "On") {
                var oDroppedList = oEvent
                    .getParameter("droppedControl")
                    .getBindingContext("draft")
                    .getProperty("Tasks");
                oDroppedList.push(oDraggedItem);
            } else {
                var oDroppedItem = oEvent
                    .getParameter("droppedControl")
                    .getBindingContext("draft")
                    .getObject();
                var oDroppedList = oEvent
                    .getParameter("droppedControl")
                    .getParent()
                    .getBindingContext("draft")
                    .getProperty("Tasks");
                var iDroppedIndex =
                    oDroppedList.indexOf(oDroppedItem) +
                    (sDropPosition === "After" ? 1 : 0);
                oDroppedList.splice(iDroppedIndex, 0, oDraggedItem);
            }

            this.getView().getModel("draft").refresh();
        },

        onBackPress: function () {
            this.getOwnerComponent().getRouter().navTo("projects");
        },
    });
});
