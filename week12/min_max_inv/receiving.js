'use strict';

window.mminv.receiving = {
	divId : 'receiving',
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
		// Remove all the rows from the receiving table.
		const divId = this.divId;
		const tbody = document.querySelector(
				`#${divId} > form > table > tbody`);
		window.mminv.removeAllChildren(tbody);
	},


	prepare : function() {
		window.mminv.getCollection('products', this.process);
	},


	process : function(products) {
		const self = window.mminv.receiving;
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


	/*
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
	*/


	submit : function(event) {
		const self = window.mminv.receiving;
		if (self.validate()) {
			// TODO
		}
	},


	validate : function() {
		const divId = this.divId;
		const inputs = document.querySelectorAll(
			`#${divId} > form > table input[name="received"]`);
		return Array.from(inputs).every((input) => {
			let valid = true;
			const value = input.value;
			if (value != "") {
				const received = parseInt(value);
				valid = (!isNaN(received) && received >= 0 &&
						Math.abs(received - parseFloat(value)) == 0);
			}
			return valid;
		});
	},


	clear : function(event) {
		const divId = window.mminv.receiving.divId;
		const inputs = document.querySelectorAll(
			`#${divId} > form > table input[name="received"]`);
		Array.from(inputs).forEach((input) => input.value = '');
	}
};
