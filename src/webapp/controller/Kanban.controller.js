sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageToast",
        "sap/ui/core/Fragment",
        "sap/ui/model/json/JSONModel",
        "sap/m/library",
        "fokind/kanban/model/model",
    ],
    function (
        Controller,
        MessageToast,
        Fragment,
        JSONModel,
        mobileLibrary,
        model
    ) {
        "use strict";

        var ButtonType = mobileLibrary.ButtonType;

        return Controller.extend("fokind.kanban.controller.Kanban", {
            onInit: function () {
                var oComponent = this.getOwnerComponent();
                oComponent
                    .getRouter()
                    .getRoute("kanban")
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
                    parameters: {
                        $expand: "States($orderby=order;$expand=Tasks)",
                    },
                });

                oView
                    .getBindingContext()
                    .requestObject()
                    .then(function (oData) {
                        oView.getModel("kanban").setData(oData);
                    });
            },

            onEditPress: function () {
                var sId = this.getView().getBindingContext().getProperty("_id");
                this.getOwnerComponent().getRouter().navTo("projectEdit", {
                    id: sId,
                });
            },

            onAddTaskPress: function () {
                var oView = this.getView();
                var oDialog = this.byId("createTaskDialog");
                if (!oDialog) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "fokind.kanban.fragment.CreateTaskDialog",
                        controller: this,
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        oDialog.setModel(new JSONModel({}), "task");
                        oDialog.open();
                    });
                } else {
                    oDialog.getModel("task").setData({});
                    oDialog.open();
                }
            },

            onCreateTaskOkPress: function () {
                var oDialog = this.byId("createTaskDialog");
                var oTaskModel = oDialog.getModel("task");
                var oKanbanModel = this.getView().getModel("kanban");
                var aTasks = oKanbanModel.getProperty("/States/0/Tasks"); // хотя бы одна колонка должна быть
                var iLength = aTasks.length;
                var oTask = {
                    title: oTaskModel.getProperty("/title"),
                    order: iLength === 0 ? 0 : aTasks[iLength - 1].order + 1,
                    stateId: oKanbanModel.getProperty("/States/0/_id"),
                };
                model
                    .ajaxPromise("POST", "/Tasks", oTask)
                    .then(function (oData) {
                        oTask._id = oData._id;
                        aTasks.push(oTask);
                        oKanbanModel.refresh();
                        oDialog.close();
                    });
            },

            onCreateTaskCancelPress: function () {
                this.byId("createTaskDialog").close();
            },

            _saveTaskPromise: function (sTaskId, oData) {
                return model.ajaxPromise(
                    "PATCH",
                    "/Tasks('" + sTaskId + "')",
                    oData
                );
            },

            onEditTaskPress: function (oEvent) {
                var oBindingContext = oEvent
                    .getSource()
                    .getBindingContext("kanban");
                var oData = {
                    _sPath: oBindingContext.getPath(),
                    _id: oBindingContext.getProperty("_id"),
                    title: oBindingContext.getProperty("title"),
                };
                var oView = this.getView();
                var oDialog = this.byId("editTaskDialog");
                if (!oDialog) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "fokind.kanban.fragment.EditTaskDialog",
                        controller: this,
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        oDialog.setModel(new JSONModel(oData), "task");
                        oDialog.open();
                    });
                } else {
                    oDialog.getModel("task").setData(oData);
                    oDialog.open();
                }
            },

            onEditTaskOkPress: function () {
                var oDialog = this.byId("editTaskDialog");
                var oTaskModel = oDialog.getModel("task");
                var oKanbanModel = this.getView().getModel("kanban");
                var sPath = oTaskModel.getProperty("/_sPath");
                var oTask = {
                    title: oTaskModel.getProperty("/title"),
                };
                model
                    .ajaxPromise(
                        "PATCH",
                        "/Tasks('" + oTaskModel.getProperty("/_id") + "')",
                        oTask
                    )
                    .then(function () {
                        oKanbanModel.setProperty(
                            sPath + "/title",
                            oTaskModel.getProperty("/title")
                        );
                        oDialog.close();
                    });
            },

            onEditTaskCancelPress: function () {
                this.byId("editTaskDialog").close();
            },

            onDrop: function (oEvent) {
                var oDraggedItem = oEvent
                    .getParameter("draggedControl")
                    .getBindingContext("kanban")
                    .getObject();

                // удалить из исходного
                var oDraggedList = oEvent
                    .getParameter("draggedControl")
                    .getParent()
                    .getBindingContext("kanban")
                    .getProperty("Tasks");
                var iDraggedIndex = oDraggedList.indexOf(oDraggedItem);
                oDraggedList.splice(iDraggedIndex, 1);

                // добавить в целевой
                var sDropPosition = oEvent.getParameter("dropPosition");
                var oDroppedListControl;
                var oDroppedList;

                if (sDropPosition === "On") {
                    oDroppedListControl = oEvent.getParameter("droppedControl");
                    oDroppedList = oDroppedListControl
                        .getBindingContext("kanban")
                        .getProperty("Tasks");
                    oDroppedList.push(oDraggedItem);
                } else {
                    var oDroppedItem = oEvent
                        .getParameter("droppedControl")
                        .getBindingContext("kanban")
                        .getObject();
                    oDroppedListControl = oEvent
                        .getParameter("droppedControl")
                        .getParent();
                    oDroppedList = oDroppedListControl
                        .getBindingContext("kanban")
                        .getProperty("Tasks");
                    var iDroppedIndex =
                        oDroppedList.indexOf(oDroppedItem) +
                        (sDropPosition === "After" ? 1 : 0);
                    oDroppedList.splice(iDroppedIndex, 0, oDraggedItem);
                }

                this.getView().getModel("kanban").refresh();

                // сохранить изменения
                var sTaskId = oDraggedItem._id;
                var sStateId = oDroppedListControl
                    .getBindingContext("kanban")
                    .getProperty("_id");

                var oDelta = {
                    // order: oDraggedItem.order,
                    stateId: sStateId,
                };

                this._saveTaskPromise(sTaskId, oDelta).then(function () {
                    MessageToast.show("Изменения успешно сохранены.");
                });
            },

            onBackPress: function () {
                this.getOwnerComponent().getRouter().navTo("projects");
            },
        });
    }
);
