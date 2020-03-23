sap.ui.define([
	'sap/ui/core/mvc/Controller',
	"sap/m/Dialog",
	"sap/m/VBox",
	"sap/m/TextArea",
	"sap/m/Button",
	"sap/m/library"
], function (Controller, Dialog, VBox, TextArea, Button, mobileLibrary) {
	"use strict";
	
	var ButtonType = mobileLibrary.ButtonType;

	return Controller.extend("fokind.kanban.controller.App", {
	    _openDialog: function (sSummary, fnCallback) {
			var oDialog = new Dialog({
				title: 'Summary',
				content: [
				    new VBox({
				        items: [
				            new TextArea('summary', {
    						    width: '100%',
    						    value: sSummary,
    						    placeholder: 'Input something...'
					        })
			            ]
				    }).addStyleClass("sapUiTinyMargin")
				],
				beginButton: new Button({
					type: ButtonType.Emphasized,
					text: 'OK',
					press: function () {
						var sText = sap.ui.getCore().byId('summary').getValue();
						fnCallback(null, sText);
						oDialog.close();
					}
				}),
				endButton: new Button({
					text: 'Cancel',
					press: function () {
						oDialog.close();
					}
				}),
				afterClose: function () {
					oDialog.destroy();
				}
			});

			oDialog.open();
	    },
	    
		onDetailPress: function (oEvent) {
		    var oBindingContext = oEvent.getSource().getBindingContext();
		    var sPath = oBindingContext.getPath();
		    var sSummary = oBindingContext.getProperty(sPath + "/summary");
		    
		    this._openDialog(sSummary, function (oError, sText) {
		        oBindingContext.getModel().setProperty(sPath + "/summary", sText);
		    });
		},

		onDrop: function (oEvent) {
			var oModel = oEvent.getParameter("draggedControl").getBindingContext().getModel();
			var oDraggedItem = oEvent.getParameter("draggedControl").getBindingContext().getObject();

			// удалить из исходного
			var oDraggedList = oEvent.getParameter("draggedControl").getParent().getBindingContext().getProperty("tasks");
			var iDraggedIndex = oDraggedList.indexOf(oDraggedItem);
			oDraggedList.splice(iDraggedIndex, 1);

			// добавить в целевой
			var sDropPosition = oEvent.getParameter("dropPosition");

			if (sDropPosition === "On") {
				var oDroppedList = oEvent.getParameter("droppedControl").getBindingContext().getProperty("tasks");
				oDroppedList.push(oDraggedItem);
			} else {
				var oDroppedItem = oEvent.getParameter("droppedControl").getBindingContext().getObject();
				var oDroppedList = oEvent.getParameter("droppedControl").getParent().getBindingContext().getProperty("tasks");
				var iDroppedIndex = oDroppedList.indexOf(oDroppedItem) + (sDropPosition === "After" ? 1 : 0);
				oDroppedList.splice(iDroppedIndex, 0, oDraggedItem);
			}

			// обновить модель
			oModel.refresh();
		}
	});
});