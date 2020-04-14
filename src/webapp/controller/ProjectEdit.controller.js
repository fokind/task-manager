sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageToast",
        "sap/ui/core/Fragment",
        "sap/ui/model/json/JSONModel",
        "fokind/kanban/model/model",
    ],
    function (Controller, MessageToast, Fragment, JSONModel, model) {
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
                    parameters: {
                        $expand: "States($orderby=order)",
                    },
                });

                oView
                    .getBindingContext()
                    .requestObject()
                    .then(function (oData) {
                        var aStates = oData.States;

                        for (let i = 0; i < aStates.length; i++) {
                            aStates[i]._METHOD = "";
                        }

                        oView.getModel("draft").setData(oData);
                    });
            },

            onAddStatePress: function () {
                var oView = this.getView();
                var oDialog = this.byId("createStateDialog");
                var oData = {
                    title: "",
                };

                if (!oDialog) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "fokind.kanban.fragment.CreateStateDialog",
                        controller: this,
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        oDialog.setModel(new JSONModel(oData), "state");
                        oDialog.open();
                    });
                } else {
                    oDialog.getModel("state").setData(oData);
                    oDialog.open();
                }
            },

            onCreateStateOkPress: function () {
                var oDialog = this.byId("createStateDialog");
                var oStateModel = oDialog.getModel("state");
                var oDraftModel = this.getView().getModel("draft");
                var aStates = oDraftModel.getProperty("/States");
                aStates.push({
                    _METHOD: "CREATE",
                    title: oStateModel.getProperty("/title"),
                    order: aStates.length,
                    projectId: oDraftModel.getProperty("/_id"),
                });
                oDraftModel.refresh(true);

                oDialog.close();
            },

            onCreateStateCancelPress: function () {
                this.byId("createStateDialog").close();
            },

            onStatePress: function (oEvent) {
                var oView = this.getView();
                var oBindingContext = oEvent
                    .getSource()
                    .getBindingContext("draft");

                var oDialog = this.byId("editStateDialog");

                if (!oDialog) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "fokind.kanban.fragment.EditStateDialog",
                        controller: this,
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        oDialog.setModel(
                            new JSONModel(oBindingContext.getObject()),
                            "state"
                        );
                        oDialog.open();
                    });
                } else {
                    oDialog.open();
                }
            },

            onEditStateOkPress: function () {
                var oDialog = this.byId("editStateDialog");
                var oStateModel = oDialog.getModel("state");
                var sId = oStateModel.getProperty("/_id");
                var oDraftModel = this.getView().getModel("draft");
                var oState = oDraftModel
                    .getProperty("/States")
                    .filter(function (e) {
                        return e._id === sId;
                    })[0];
                oState.title = oStateModel.getProperty("/title");
                if (!oState._METHOD) {
                    oState._METHOD = "UPDATE";
                }
                oDraftModel.refresh();
                oDialog.close();
            },

            onEditStateCancelPress: function () {
                this.byId("editStateDialog").close();
            },

            onStateDelete: function (oEvent) {
                var oLIstItem = oEvent.getParameter("listItem");
                var oBindingContext = oLIstItem.getBindingContext("draft");
                oBindingContext
                    .getModel()
                    .setProperty(
                        oBindingContext.getPath() + "/_METHOD",
                        "DELETE"
                    );

                oBindingContext.getModel().refresh(true);
            },

            onDeleteProjectPress: function () {
                var oView = this.getView();
                var sPath = oView.getBindingContext().getPath();
                model.ajaxPromise("DELETE", sPath).then(
                    function () {
                        oView.getModel().refresh();
                        MessageToast.show("Изменения успешно сохранены.");
                        this.getOwnerComponent().getRouter().navTo("projects");
                    }.bind(this)
                );
            },

            onSavePress: function () {
                var oView = this.getView();
                var sPath = oView.getBindingContext().getPath();
                var oDraftModel = oView.getModel("draft");
                var oData = {
                    title: oDraftModel.getProperty("/title"),
                };

                Promise.all([
                    model.ajaxPromise("PATCH", sPath, oData),
                    Promise.all(
                        oDraftModel
                            .getProperty("/States")
                            .map(function (oState) {
                                switch (oState._METHOD) {
                                    case "CREATE":
                                        return model
                                            .ajaxPromise("POST", "/States", {
                                                projectId: oDraftModel.getProperty(
                                                    "/_id"
                                                ),
                                                title: oState.title,
                                                order: oState.order,
                                            })
                                            .then(function () {
                                                delete oState._METHOD;
                                            });
                                    case "UPDATE": // UNDONE при переименовании или изменении порядка сортировки
                                        return model
                                            .ajaxPromise(
                                                "PATCH",
                                                "/States('" + oState._id + "')",
                                                {
                                                    title: oState.title,
                                                    order: oState.order,
                                                }
                                            )
                                            .then(function () {
                                                delete oState._METHOD;
                                            });
                                    case "DELETE":
                                        return model
                                            .ajaxPromise(
                                                "DELETE",
                                                "/States('" + oState._id + "')"
                                            )
                                            .then(function () {
                                                delete oState._METHOD;
                                                // TODO удалять из массива?
                                            });
                                    default:
                                        return Promise.resolve();
                                }
                            })
                    ),
                ]).then(function () {
                    oView.getModel().refresh();
                    MessageToast.show("Изменения успешно сохранены.");
                });
            },

            onStateDrop: function (oEvent) {
                var oDraftModel = this.getView().getModel("draft");
                var oDraggedItem = oEvent
                    .getParameter("draggedControl")
                    .getBindingContext("draft")
                    .getObject();

                var sDropPosition = oEvent.getParameter("dropPosition");
                var oDroppedListControl;
                var oDroppedList;
                var fOrder = 0;

                if (sDropPosition !== "On") {
                    var oDroppedControl = oEvent.getParameter("droppedControl");
                    var oDroppedItem = oDroppedControl
                        .getBindingContext("draft")
                        .getObject();
                    oDroppedListControl = oEvent
                        .getParameter("droppedControl")
                        .getParent();
                    oDroppedList = oDraftModel.getProperty("/States");
                    var iDroppedIndex = oDroppedListControl
                        .getItems()
                        .indexOf(oDroppedControl);

                    if (
                        sDropPosition === "After" &&
                        iDroppedIndex + 1 === oDroppedList.length
                    ) {
                        fOrder = oDroppedItem.order + 1;
                    } else if (
                        sDropPosition === "Before" &&
                        iDroppedIndex === 0
                    ) {
                        fOrder = oDroppedItem.order - 1;
                    } else {
                        var oDroppedIndex1 =
                            iDroppedIndex +
                            (sDropPosition === "After" ? 1 : -1);
                        var oDroppedControl1 = oDroppedListControl.getItems()[
                            oDroppedIndex1
                        ];
                        var oDroppedItem1 = oDroppedControl1
                            .getBindingContext("draft")
                            .getObject();
                        fOrder = (oDroppedItem.order + oDroppedItem1.order) / 2;
                    }
                }

                oDraggedItem.order = fOrder;

                if (!oDraggedItem._METHOD) {
                    oDraggedItem._METHOD = "UPDATE";
                }

                oDraftModel.refresh(true);
            },

            onBackPress: function () {
                var sId = this.getView().getModel("draft").getProperty("/_id");
                this.getOwnerComponent().getRouter().navTo("kanban", {
                    id: sId,
                });
            },
        });
    }
);
