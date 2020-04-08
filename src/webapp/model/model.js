sap.ui.define([], function () {
    "use strict";

    return {
        getKanban: function (oContext) {
            var oModel = oContext.getModel();
            var oStatesBinding = oModel.bindList("States", oContext);
            return oContext.requestObject().then(function () {
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
                                            order: oTaskContext.getProperty(
                                                "order"
                                            ),
                                            stateId: oTaskContext.getProperty(
                                                "stateId"
                                            ),
                                        };
                                    }),
                            };
                        }),
                };

                return oDraft;
            });
        },
    };
});
