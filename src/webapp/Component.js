sap.ui.define(["sap/ui/core/UIComponent"], function(UIComponent) {
    "use strict";

    return UIComponent.extend("fokind.kanban.Component", {
        metadata: {
            manifest: "json"
        },

        init: function() {
            UIComponent.prototype.init.apply(this, arguments);
            var oRouter = this.getRouter();
            oRouter.initialize();
        }
    });
});
