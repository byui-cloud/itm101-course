'use strict';

window.mminv.suppliers = {
	init : function() {
	},


	empty : function() {
		// Remove all the rows from the suppliers table.
		const tbody = document.querySelector('#suppliers > table > tbody');
		window.mminv.removeAllChildren(tbody);
	},


	prepare : function() {
		window.mminv.getCollection('suppliers', this.process);
	},


	process : function(suppliers) {
		const self = window.mminv.receiving;
		const create = window.mminv.createElem;
		const tbody = document.querySelector('#suppliers > table > tbody');
		suppliers.forEach((doc) => {
			let suplrId = doc.id;
			let suplrData = doc.data();
			let cellId = create('td', null, null, suplrId);

			let suplrName = suplrData['supplier_name'];
			let cellName = create('td', null, null, suplrName);

			let suplrEmail = suplrData['email_address']
			let cellEmail = create('td', null, null, suplrEmail);

			let suplrPhone = suplrData['phone_number']
			let cellPhone = create('td', null, null, suplrPhone);

			let row = create('tr');
			row.appendChild(cellId);
			row.appendChild(cellName);
			row.appendChild(cellEmail);
			row.appendChild(cellPhone);
			tbody.appendChild(row);
		});
	}
};
