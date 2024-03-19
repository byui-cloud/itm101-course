'use strict';

window.mminv.outgoing = {
	init : function() {
		const ctrls = document.querySelector('#outgoing > div.controls');
		const pairs = [
			['submit', this.submit],
			['clear', this.clear]
		];
		pairs.forEach((pair) => {
			const [name, func] = pair;
			const button = ctrls.querySelector(`button[name="${name}"]`);
			button.addEventListener('click', func);
		});
	},


	empty : function() {
		// Remove all the rows from the outgoing table.
		const tbody = document.querySelector(
				'#outgoing > form > table > tbody');
		window.mminv.removeAllChildren(tbody);
	},


	prepare : function() {
		window.mminv.getCollection('products', this.process);
	},


	process : function(products) {
		const self = window.mminv.receiving;
		const create = window.mminv.createElem;
		const tbody = document.querySelector(
				'#outgoing > form > table > tbody');
		products.forEach((doc) => {
			let prodId = doc.id;
			let prodData = doc.data();
			let cellId = create('td', null, null, prodId);

			let prodName = prodData['product_name'];
			let cellName = create('td', null, null, prodName);

			let quant = prodData['quantity'];
			let cellQuant = create('td', null, null, quant);

			let input = create('input', null, {type:'number', name:'issued',
					min:0, max:quant, step:1, pattern:'^(0|[1-9][0-9]*)$'});
			let cellIssued = create('td');
			cellIssued.appendChild(input);

			let row = create('tr');
			row.appendChild(cellId);
			row.appendChild(cellName);
			row.appendChild(cellQuant);
			row.appendChild(cellIssued);
			tbody.appendChild(row);
		});
	},


	submit : function(event) {
		if (this.validate()) {
		}
	},


	validate : function() {
		return true;
	},


	clear : function(event) {
		const inputs = document.querySelectorAll(
			'#outgoing > form > table.products input[name="issued"]');
		Array.from(inputs).forEach(input => input.value = '');
	}
};
