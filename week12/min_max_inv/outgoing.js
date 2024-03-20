'use strict';

window.mminv.outgoing = {
	divId : 'outgoing',
	snapshot : { },


	init : function() {
		const divId = this.divId;
		const ctrls = document.querySelector(`#${divId} > div.controls`);
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
		const divId = this.divId;
		const tbody = document.querySelector(
				`#${divId} > form > table > tbody`);
		window.mminv.removeAllChildren(tbody);
	},


	prepare : function() {
		window.mminv.getCollection('products', this.process);
	},


	process : function(products) {
		const self = window.mminv.outgoing;
		const divId = self.divId;
		const create = window.mminv.createElem;
		const tbody = document.querySelector(
				`#${divId} > form > table > tbody`);
		self.snapshot = { };
		products.forEach((doc) => {
			let prodId = doc.id;
			let prodData = doc.data();
			self.snapshot[prodId] = prodData;

			let cellId = create('td', null, {name:'product_id'}, prodId);

			let prodName = prodData['product_name'];
			let cellName = create('td', null, null, prodName);

			let quant = prodData['quantity'];
			let cellQuant = create('td', 'number', null, quant);

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
		const self = window.mminv.outgoing;
		if (self.validate()) {
			alert("Valid!");
			// TODO
		}
	},


	validate : function() {
		const divId = this.divId;
		const snapshot = this.snapshot;
		const inputs = document.querySelectorAll(
			`#${divId} > form > table input[name="issued"]`);
		return Array.from(inputs).every((input) => {
			let valid = true;
			const value = input.value;
			if (value != "") {
				const issued = parseInt(value);
				valid = (!isNaN(issued) && issued >= 0 &&
						Math.abs(issued - parseFloat(value)) == 0);
				if (valid) {
					const row = input.closest('tr');
					const cell = row.querySelector('td[name="product_id"]');
					const prodId = cell.innerText;
					const quant = snapshot[prodId]['quantity'];
					valid = (issued <= quant);
				}
			}
			return valid;
		});
	},


	clear : function(event) {
		const divId = window.mminv.outgoing.divId;
		const inputs = document.querySelectorAll(
			`#${divId} > form > table input[name="issued"]`);
		Array.from(inputs).forEach((input) => input.value = '');
	}
};
