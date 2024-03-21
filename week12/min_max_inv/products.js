'use strict';

window.mminv.products = {
	divId : 'products',


	init : function() {
	},


	prepare : function() {
		const self = this;
		const names = window.mminv.dbNames;
		window.mminv.getCollection(names.products,
				(snapshot) => self.process(snapshot));
	},


	process : function(products) {
		const names = window.mminv.dbNames;
		const create = window.mminv.createElem;
		const tbody = this.getTableBody();
		for (let [prodId, prodData] of Object.entries(products)) {
			let cellId = create('td', null, null, prodId);

			let prodName = prodData[names.prodName];
			let cellName = create('td', null, null, prodName);

			let minQuant = prodData[names.minQuant]
			let cellMinQuant = create('td', 'number', null, minQuant);

			let quant = prodData[names.quant]
			let cellQuant = create('td', 'number', null, quant);

			let maxQuant = prodData[names.maxQuant]
			let cellMaxQuant = create('td', 'number', null, maxQuant);

			let suplrId = prodData[names.suplrId]
			let cellSuplrId = create('td', null, null, suplrId);

			let row = create('tr');
			row.appendChild(cellId);
			row.appendChild(cellName);
			row.appendChild(cellMinQuant);
			row.appendChild(cellQuant);
			row.appendChild(cellMaxQuant);
			row.appendChild(cellSuplrId);
			tbody.appendChild(row);
		}
	},


	empty : function() {
		// Remove all the rows from the products table.
		window.mminv.removeAllChildren(this.getTableBody());
	},


	getTableBody : function() {
		return document.querySelector(`#${this.divId} > table > tbody`);
	}
};
