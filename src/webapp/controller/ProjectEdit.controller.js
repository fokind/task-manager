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
                        oView.getModel("draft").setData(oData);
                    });
            },

            onStatesSumbmit: function (oEvent) {
                var oSource = oEvent.getSource();
                oSource.setValue("");
                var oDraftModel = oSource.getModel("draft");
                var aStates = oDraftModel.getProperty("/States");
                aStates.push({
                    _METHOD: "CREATE",
                    order: aStates.length,
                    title: oEvent.getParameter("value"),
                });
                oDraftModel.refresh();
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
                var oBindingContext = oEvent
                    .getSource()
                    .getBindingContext("draft");
                oBindingContext
                    .getModel()
                    .setProperty(
                        oBindingContext.getPath() + "/_METHOD",
                        "DELETE"
                    );
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

            onBackPress: function () {
                var sId = this.getView().getModel("draft").getProperty("/_id");
                this.getOwnerComponent().getRouter().navTo("kanban", {
                    id: sId,
                });
            },
        });
    }
);
