sap.ui.define([
	'sap/ui/core/mvc/Controller'
], function (Controller) {
	"use strict";

	return Controller.extend("fokind.kanban.controller.Projects", {
		onAddPress: function() {
		  //  var oModel = this.getView().getModel();
		  //  var sId = Math.random().toString(36).substring(2) + Date.now().toString(36);
		  //  oModel.getProperty("/Projects").push({
		  //      id: sId,
		  //      title: sId
		  //  });
		  //  oModel.refresh();
		  //  var oList = this.byId("items");
		  //  var oBinding = oList.getBinding("items");
		  //  var oContext = oBinding.create({
		  //      id: "0",
		  //      name: "new 1",
		  //      amount: 0
		  //  })
		},
		
		onItemPress: function(oEvent) {
		    this.getOwnerComponent().getRouter().navTo("kanban", {
		        id: "0"
		    });
		}
	});
});