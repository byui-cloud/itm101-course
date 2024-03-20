'use strict';

window.mminv.products = {
	init : function() {
	},


	empty : function() {
		// Remove all the rows from the products table.
		const tbody = document.querySelector('#products > table > tbody');
		window.mminv.removeAllChildren(tbody);
	},


	prepare : function() {
		window.mminv.getCollection('products', this.process);
	},


	process : function(products) {
		const self = window.mminv.receiving;
		const create = window.mminv.createElem;
		const tbody = document.querySelector('#products > table > tbody');
		products.forEach((doc) => {
			let prodId = doc.id;
			let prodData = doc.data();
			let cellId = create('td', null, null, prodId);

			let prodName = prodData['product_name'];
			let cellName = create('td', null, null, prodName);

			let minQuant = prodData['min_quantity']
			let cellMinQuant = create('td', 'number', null, minQuant);

			let quant = prodData['quantity']
			let cellQuant = create('td', 'number', null, quant);

			let maxQuant = prodData['max_quantity']
			let cellMaxQuant = create('td', 'number', null, maxQuant);

			let suplrId = prodData['supplier_id']
			let cellSuplrId = create('td', null, null, suplrId);

			let row = create('tr');
			row.appendChild(cellId);
			row.appendChild(cellName);
			row.appendChild(cellMinQuant);
			row.appendChild(cellQuant);
			row.appendChild(cellMaxQuant);
			row.appendChild(cellSuplrId);
			tbody.appendChild(row);
		});
	}
};
