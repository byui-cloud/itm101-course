'use strict';

window.mminv.receiving = {
	divId : 'receiving',
	snapshot : { },


	init : function() {
		const self = this;
		const ctrls = document.querySelector(`#${this.divId} > div.controls`);
		const pairs = [
			['submit', (event) => self.submit(event)],
			['clear', (event) => self.clear(event)]
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
			let cellId = create('td', null, {name:names.prodId}, prodId);

			let prodName = prodData[names.prodName];
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
		}
	},


	submit : function(event) {
		const updates = this.validate();
		if (updates) {
			const owner = window.mminv;
			const names = owner.dbNames;
			const object = { };
			for (let [prodId, received] of Object.entries(updates)) {
				const prodData = this.snapshot[prodId];

				// Compute a new quantity by adding the received quantity.
				let quant = prodData[names.quant];
				quant += received;

				// Update the Firestore document.
				object[names.quant] = quant;
				owner.updateDocument(names.products, prodId, object);
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
		const inputs = tbody.querySelectorAll('input[name="received"]');
		const allValid = Array.from(inputs).every((input) => {
			let valid = true;
			const value = input.value;
			if (value != '') {
				// Verify that the user entered a non-negative integer.
				const received = parseInt(value);
				valid = (!isNaN(received) && received >= 0 &&
						Math.abs(received - parseFloat(value)) == 0);
				if (valid) {
					// Get the product_id from the current table row.
					const row = input.closest('tr');
					const cell= row.querySelector(`td[name="${names.prodId}"]`);
					const prodId = cell.innerText;
					updates[prodId] = received;
				}
			}
			return valid;
		});
		return allValid ? updates : null;
	},


	clear : function(event) {
		const tbody = this.getTableBody();
		const inputs = tbody.querySelectorAll('input[name="received"]');
		Array.from(inputs).forEach((input) => input.value = '');
	},


	empty : function() {
		delete this.snapshot;
		// Remove all the rows from the receiving table.
		window.mminv.removeAllChildren(this.getTableBody());
	},


	getTableBody : function() {
		return document.querySelector(`#${this.divId} > form > table > tbody`);
	}
};
