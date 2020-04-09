sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageToast",
        "sap/m/Token",
        "fokind/kanban/model/model",
    ],
    function (Controller, MessageToast, Token, model) {
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
                        $expand: "States",
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

            onSavePress: function () {
                var oView = this.getView();
                var sPath = oView.getBindingContext().getPath();
                var oDraftModel = oView.getModel("draft");
                var oData = {
                    title: oDraftModel.getProperty("/title"),
                };

                // console.log(oDraftModel);
                Promise.all([
                    model.updatePromise(sPath, oData),
                    Promise.all(
                        oDraftModel
                            .getProperty("/States")
                            .map(function (oState) {
                                console.log(oState);
                                switch (oState._METHOD) {
                                    case "CREATE":
                                        return model.createPromise("/States", {
                                            projectId: oDraftModel.getProperty(
                                                "/_id"
                                            ),
                                            title: oState.title,
                                            order: oState.order,
                                        });
                                    case "UPDATE":
                                        return model.updatePromise(
                                            "/States('" + oState._id + "')",
                                            {
                                                title: oState.title,
                                                order: oState.order,
                                            }
                                        );
                                    case "DELETE":
                                        return model.deletePromise(
                                            "/States('" + oState._id + "')"
                                        );
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
