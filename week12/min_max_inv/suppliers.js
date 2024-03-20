'use strict';

window.mminv.suppliers = {
	divId : 'suppliers',


	init : function() {
	},


	prepare : function() {
		const self = this;
		const names = window.mminv.dbNames;
		window.mminv.getCollection(names.suppliers,
				(snapshot) => self.process(snapshot));
	},


	process : function(suppliers) {
		const names = window.mminv.dbNames;
		const create = window.mminv.createElem;
		const tbody = this.getTableBody();
		for (let [suplrId, suplrData] of Object.entries(suppliers)) {
			let cellId = create('td', null, null, suplrId);

			let suplrName = suplrData[names.suplrName];
			let cellName = create('td', null, null, suplrName);

			let suplrEmail = suplrData[names.email]
			let cellEmail = create('td', null, null, suplrEmail);

			let suplrPhone = suplrData[names.phone]
			let cellPhone = create('td', null, null, suplrPhone);

			let row = create('tr');
			row.appendChild(cellId);
			row.appendChild(cellName);
			row.appendChild(cellEmail);
			row.appendChild(cellPhone);
			tbody.appendChild(row);
		}
	},


	empty : function() {
		// Remove all the rows from the suppliers table.
		window.mminv.removeAllChildren(this.getTableBody());
	},


	getTableBody : function() {
		return document.querySelector(`#${this.divId} > table > tbody`);
	}
};
