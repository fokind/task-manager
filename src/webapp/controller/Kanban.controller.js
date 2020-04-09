sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageToast",
        "sap/m/Dialog",
        "sap/m/VBox",
        "sap/m/TextArea",
        "sap/m/Button",
        "sap/m/library",
    ],
    function (
        Controller,
        MessageToast,
        Dialog,
        VBox,
        TextArea,
        Button,
        mobileLibrary
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
                        $expand: "States($expand=Tasks)",
                    },
                });

                oView
                    .getBindingContext()
                    .requestObject()
                    .then(function (oData) {
                        console.log(oData);
                        oView.getModel("kanban").setData(oData);
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

            _saveTaskPromise: function (sTaskId, oDelta) {
                return $.ajax({
                    async: true,
                    url: "/odata/Tasks('" + sTaskId + "')", // TODO получать путь из модели
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    data: JSON.stringify(oDelta),
                });
            },

            _openDialog: function (sTitle, fnCallback) {
                var oDialog = new Dialog({
                    title: "Title",
                    content: [
                        new VBox({
                            items: [
                                new TextArea("title", {
                                    width: "100%",
                                    value: sTitle,
                                    placeholder: "Input something...",
                                }),
                            ],
                        }).addStyleClass("sapUiTinyMargin"),
                    ],
                    beginButton: new Button({
                        type: ButtonType.Emphasized,
                        text: "OK",
                        press: function () {
                            var sText = sap.ui
                                .getCore()
                                .byId("title")
                                .getValue();
                            fnCallback(null, sText);
                            oDialog.close();
                        },
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: function () {
                            oDialog.close();
                        },
                    }),
                    afterClose: function () {
                        oDialog.destroy();
                    },
                });

                oDialog.open();
            },

            onDetailPress: function (oEvent) {
                var oBindingContext = oEvent
                    .getSource()
                    .getBindingContext("kanban");
                var sPath = oBindingContext.getPath();
                var sTitle = oBindingContext.getProperty("title");

                this._openDialog(
                    sTitle,
                    function (oError, sText) {
                        oBindingContext
                            .getModel()
                            .setProperty(sPath + "/title", sText);

                        var sTaskId = oBindingContext.getProperty("_id");
                        var sTitle = oBindingContext.getProperty("title");

                        var oDelta = {
                            title: sTitle,
                        };

                        this._saveTaskPromise(sTaskId, oDelta).then(
                            function () {
                                MessageToast.show(
                                    "Изменения успешно сохранены."
                                );
                            }
                        );
                    }.bind(this)
                );
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
