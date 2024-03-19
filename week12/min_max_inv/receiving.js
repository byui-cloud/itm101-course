'use strict';

window.mminv.receiving = {
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
		// Remove all the rows from the receiving table.
		const tbody = document.querySelector(
				'#receiving > form > table > tbody');
		window.mminv.removeAllChildren(tbody);
	},


	prepare : function() {
		window.mminv.getCollection('products', this.process);
	},


	process : function(products) {
		const self = window.mminv.receiving;
		const create = window.mminv.createElem;
		const tbody = document.querySelector(
				'#receiving > form > table > tbody');
		products.forEach((doc) => {
			let prodId = doc.id;
			let prodData = doc.data();
			let cellId = create('td', null, null, prodId);

			let prodName = prodData['product_name'];
			let cellName = create('td', null, null, prodName);

			let input = create('input', null, {type:'number', name:'received',
					min:0, step:1, pattern:'^(0|[1-9][0-9]*)$'});
			let cellReceived = create('td');
			cellReceived.appendChild(input);

			let row = create('tr');
			row.appendChild(cellId);
			row.appendChild(cellName);
			row.appendChild(cellReceived);
			tbody.appendChild(row);
		});
	},


	reNonNegInt : /^(0|[1-9][0-9]*)$/,
	reNonDigits : /[^0-9]/g,
	allowInteger : function(event) {
		const self = window.mminv.receiving;
		const input = event.target;
		const value = input.value;
		const result = self.reNonNegInt.test(value);
		if (! result) {
			const approved = value.replace(self.reNonDigits, '');
			input.value = approved;
		}
	},


	submit : function() {
		if (this.validate()) {
		}
	},


	validate : function() {
		return true;
	},


	clear : function(event) {
		const inputs = document.querySelectorAll(
			'#receiving > form > table.products input[name="received"]');
		Array.from(inputs).forEach(input => input.value = '');
	}
};
