sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/Device"], function(
    UIComponent,
    Device
) {
    "use strict";

    return UIComponent.extend("fokind.kanban.Component", {
        metadata: {
            manifest: "json"
        },

        init: function() {
            UIComponent.prototype.init.apply(this, arguments);
            var oRouter = this.getRouter();
            oRouter.initialize();
        },

        getContentDensityClass: function() {
            if (!this._sContentDensityClass) {
                this._sContentDensityClass = Device.support.touch
                    ? "sapUiSizeCozy"
                    : "sapUiSizeCompact";
            }
            return this._sContentDensityClass;
        }
    });
});
