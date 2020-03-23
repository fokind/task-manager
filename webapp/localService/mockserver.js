sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (MockServer) {
	"use strict";

	return {
		init: function () {
			// create
			var oMockServer = new MockServer({
				rootUri: "/odata/"
			});

// 			var oUriParameters = new UriParameters(window.location.href);

			// configure mock server with a delay
// 			MockServer.config({
// 				autoRespond: true,
// 				autoRespondAfter: oUriParameters.get("serverDelay") || 500
// 			});

			// simulate
// 			var sPath = "../localService";
            var sPath = jQuery.sap.getModulePath("fokind.kanban.localService");
            // debugger;
			oMockServer.simulate(sPath + "/metadata.xml", {
				sMockdataBaseUrl: sPath + "/mockdata",
				bGenerateMissingMockData: true
			});

			// start
			oMockServer.start();
		}
	};

});