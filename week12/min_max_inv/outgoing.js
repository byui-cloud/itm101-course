'use strict';

window.mminv.outgoing = {
	divId : 'outgoing',
	snapshot : { },


	init : function() {
		const self = this;
		const ctrls = document.querySelector(`#${this.divId} > div.controls`);
		const pairs = [
			['submit', (event) => self.submit(event)],
			['clear',  (event) => self.clear(event)]
		];
		pairs.forEach((pair) => {
			const [name, func] = pair;
			const button = ctrls.querySelector(`button[name="${name}"]`);
			button.addEventListener('click', func);
		});
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
		this.snapshot = products;
		for (let [prodId, prodData] of Object.entries(products)) {
			let cellId = create('td', null, {name: names.prodId}, prodId);

			let prodName = prodData[names.prodName];
			let cellName = create('td', null, null, prodName);

			let quant = prodData[names.quant];
			let cellQuant = create('td', 'number', {name:names.quant}, quant);

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
		}
	},


	submit : function(event) {
		const updates = this.validate();
		if (updates) {
			const owner = window.mminv;
			const names = owner.dbNames;
			const tbody = this.getTableBody();
			const object = { };
			for (let [prodId, issued] of Object.entries(updates)) {
				const prodData = this.snapshot[prodId];

				// Compute a new quantity by subtracting the issued quantity.
				let quant = prodData[names.quant];
				quant -= issued;

				// Update the Firestore document.
				object[names.quant] = quant;
				owner.updateDocument(names.products, prodId, object);

				// Update the local cached copy of the product data.
				prodData[names.quant] = quant;

				// Update the user interface fragment.
				const column = tbody.querySelectorAll(
						`td[name="${names.prodId}"]`);
				const cellProdId = Array.from(column).find(
						(elem) => elem.innerText == prodId);
				const row = cellProdId.closest('tr');
				const cellQuant = row.querySelector(`td[name="${names.quant}"]`);
				cellQuant.innerText = quant;

				// If a new quantity falls below the min_quantity,
				// create an order for enough product to raise the
				// quantity to max_quantity (max_quantity - quantity).
				let minQuant = prodData[names.minQuant];
				if (quant < minQuant) {
					let maxQuant = prodData[names.maxQuant];
					owner.orders.order(prodId, maxQuant - quant);
				}
			}

			// Clear the inputs in this fragment.
			this.clear();
		}
	},


	validate : function() {
		const snapshot = this.snapshot;
		const names = window.mminv.dbNames;
		const updates = { };
		const tbody = this.getTableBody();
		const inputs = tbody.querySelectorAll('input[name="issued"]');
		const allValid = Array.from(inputs).every((input) => {
			let valid = true;
			const value = input.value;
			if (value != '') {
				// Verify that the user entered a non-negative integer.
				const issued = parseInt(value);
				valid = (!isNaN(issued) && issued >= 0 &&
						Math.abs(issued - parseFloat(value)) == 0);
				if (valid) {
					// Get the product_id from the current table row.
					const row = input.closest('tr');
					const cell= row.querySelector(`td[name="${names.prodId}"]`);
					const prodId = cell.innerText;
					// Verify that the issued amount is less
					// than or equal to the quantity in stock.
					const quant = snapshot[prodId][names.quant];
					valid = (issued <= quant);
					if (valid) {
						updates[prodId] = issued;
					}
				}
			}
			return valid;
		});
		return allValid ? updates : null;
	},


	clear : function(event) {
		const tbody = this.getTableBody();
		const inputs = tbody.querySelectorAll('input[name="issued"]');
		Array.from(inputs).forEach((input) => input.value = '');
	},


	empty : function() {
		delete this.snapshot;
		// Remove all the rows from the outgoing table.
		window.mminv.removeAllChildren(this.getTableBody());
	},


	getTableBody : function() {
		return document.querySelector(`#${this.divId} > form > table > tbody`);
	}
};
