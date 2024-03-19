'use strict';

window.mminv.suppliers = {
	snapshot : { },
	keys : [ ],
	current : 0,


	init : function() {
		const pairs = [
			['prev',   this.previousSupplier],
			//['new',    this.newSupplier],
			['update', this.updateSupplier],
			['delete', this.deleteSupplier],
			['next',   this.nextSupplier]
		];
		const ctrls = document.querySelector('#suppliers > div.controls');
		pairs.forEach((pair) => {
			const [name, func] = pair;
			const button = ctrls.querySelector(`button[name="${name}"]`);
			button.addEventListener('click', func);
		});
	},


	clear : function() {
		// Clear all the inputs in the suppliers form.
		const getById = window.mminv.getById;
		getById('suplr_id').value = '';
		getById('suplr_name').value = '';
		getById('suplr_email').value = '';
		getById('suplr_phone').value = '';
	},


	prepare : function() {
		const owner = window.mminv;
		owner.getCollection('suppliers',
			function(suppliers) {
				const self = owner.suppliers;
				self.snapshot = { };
				suppliers.forEach((doc) => self.snapshot[doc.id] = doc.data());
				self.keys = Object.keys(self.snapshot);
				self.current = 0;
				self.showSupplier(self.keys[self.current]);
			});
	},


	previousSupplier : function(event) {
		const self = window.mminv.suppliers;
		const curr = self.current - 1;
		if (curr >= 0) {
			self.current = curr;
			self.showSupplier(self.keys[curr]);
		}
	},

	nextSupplier : function(event) {
		const self = window.mminv.suppliers;
		const curr = self.current + 1;
		if (curr < self.keys.length) {
			self.current = curr;
			self.showSupplier(self.keys[curr]);
		}
	},

	showSupplier : function(suplrId) {
		const supplier = this.snapshot[suplrId];
		const getById = window.mminv.getById;
		getById('suplr_id').value = suplrId;
		const fields = [
			['suplr_name', 'supplier_name'],
			['suplr_email', 'email_address'],
			['suplr_phone', 'phone_number']
		];
		fields.forEach((field) => {
			const [htmlId, fireId] = field;
			getById(htmlId).value = supplier[fireId];
		});
	},



	// TODO
	updateSupplier : function(event) {
		const inputs = document.querySelectorAll(
				'#suppliers > form > input[name]');
		const object = { };
		Array.from(inputs).forEach((input) => {
			const name = input.getAttribute('name');
			object[name] = input.value;
		});

		const owner = window.mminv;
		const suplrId = owner.getById('suplr_id').value;
		owner.updateDocument('suppliers', suplrId, object);
	},


	// TODO
	deleteSupplier : function(event) {
		const owner = window.mminv;
		const suplrId = owner.getById('suplr_id').value;

		// Ensure the supplier id is not used by one of the products.
		owner.queryDatabase('products', 'supplier_id', '==', suplrId,
			function(snapshot) {
				if (snapshot.size == 0) {
					// Since no products use the supplier id, delete
					// the supplier as the user requested.
					owner.deleteDocument('suppliers', suplrId);
				}
			});
	}
};
