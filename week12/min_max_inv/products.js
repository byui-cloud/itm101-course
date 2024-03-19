'use strict';

window.mminv.products = {
	snapshot : { },
	keys : [ ],
	current : 0,


	init : function() {
		const pairs = [
			['prev',   this.previousProduct],
			//['new',    this.newProduct],
			['update', this.updateProduct],
			['delete', this.deleteProduct],
			['next',   this.nextProduct]
		];
		const ctrls = document.querySelector('#products > div.controls');
		pairs.forEach((pair) => {
			const [name, func] = pair;
			const button = ctrls.querySelector(`button[name="${name}"]`);
			button.addEventListener('click', func);
		});
	},


	clear : function() {
		// Clear all the inputs in the products form.
		const getById = window.mminv.getById;
		getById('prod_id').value = '';
		getById('prod_name').value = '';
		getById('min_quant').value = '';
		getById('quant').value = '';
		getById('max_quant').value = '';
		getById('prod_suplr_id').value = '';
	},


	prepare : function() {
		const owner = window.mminv;
		owner.getCollection('products',
			function(products) {
				const self = owner.products;
				self.snapshot = { };
				products.forEach((doc) => self.snapshot[doc.id] = doc.data());
				self.keys = Object.keys(self.snapshot);
				self.current = 0;
				self.showProduct(self.keys[self.current]);
			});
	},


	previousProduct : function(event) {
		const self = window.mminv.products;
		const curr = self.current - 1;
		if (curr >= 0) {
			self.current = curr;
			self.showProduct(self.keys[curr]);
		}
	},

	nextProduct : function(event) {
		const self = window.mminv.products;
		const curr = self.current + 1;
		if (curr < self.keys.length) {
			self.current = curr;
			self.showProduct(self.keys[curr]);
		}
	},

	showProduct : function(prodId) {
		const product = this.snapshot[prodId];
		const getById = window.mminv.getById;
		getById('prod_id').value = prodId;
		const fields = [
			['prod_name', 'product_name'],
			['min_quant', 'min_quantity'],
			['quant', 'quantity'],
			['max_quant', 'max_quantity'],
			['prod_suplr_id', 'supplier_id']
		];
		fields.forEach((field) => {
			const [htmlId, fireId] = field;
			getById(htmlId).value = product[fireId];
		});
	},


	// TODO
	updateProduct : function(event) {
		function noop(value) { return value; }
		function toInt(value) { return window.parseInt(value); }
		const fields = [
			['product_name', noop],
			['min_quantity', toInt],
			['quantity', toInt],
			['max_quantity', toInt],
			['supplier_id', noop]
		];
		const object = { };
		const form = document.querySelector('#products > form');
		fields.forEach((field) => {
			const [name, converter] = field;
			const input = form.querySelector(`input[name="${name}"]`);
			object[name] = converter(input.value);
		});

		const owner = window.mminv;
		const prodId = owner.getById('prod_id').value;
		owner.updateDocument('products', prodId, object);
	},


	// TODO
	deleteProduct : function(event) {
		const owner = window.mminv;
		const prodId = owner.getById('prod_id').value;
		owner.deleteDocument('products', prodId);
	}
};
