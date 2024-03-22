import {initializeApp} from
	'https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js';
import {getFirestore, collection as fireCollect, onSnapshot,
		doc as fireDoc, addDoc, updateDoc}
	from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js';


const mminv = {
	/** Shows the first tab and corresponding fragment
	 * by programmatically clicking a tab. */
	init : function(event) {
		suppliers.init();
		products.init();
		receiving.init();
		outgoing.init();

		// Add a click listener to all tabs.
		const self = this;
		const listener = (event) => self.showFrag(event);
		const tabs = document.querySelectorAll('header > ul.tabs > li');
		Array.from(tabs).forEach(
				(tab) => tab.addEventListener('click', listener));

		// Programmatically click the selected tab.
		const tab = document.querySelector('header > ul.tabs > li.selected');
		tab.click();
	},


	/** Selects one tab and shows the corresponding fragment. Also,
	 * unselects all other tabs and hides the other fragments. */
	showFrag : function(event) {
		const tab = event.currentTarget;
		const name = tab.getAttribute('name');

		// Clear all the fragments.
		suppliers.empty();
		products.empty();
		receiving.empty();
		outgoing.empty();

		// Prepare the user selected fragment
		// before showing it to the user.
		switch (name) {
			case 'products':  products.prepare();  break;
			case 'suppliers': suppliers.prepare(); break;
			case 'receiving': receiving.prepare(); break;
			case 'outgoing':  outgoing.prepare();  break;
			default:
				break;
		}

		// Remove the highlight from all tabs except
		// for the tab selected by the user.
		const selected = 'selected';
		const tabs = document.querySelectorAll('ul.tabs > li');
		Array.from(tabs).forEach((tab) => tab.classList.remove(selected));
		tab.classList.add(selected);

		// Hide all of the fragments except
		// for the one selected by the user.
		const frags = document.querySelectorAll('#main > div.frag');
		Array.from(frags).forEach((frag) => frag.classList.remove(selected));
		document.querySelector(`#${name}`).classList.add(selected);
	},


	/** Creates an HTML element. */
	createElem : function(tag, classes, attrs, text) {
		const elem = document.createElement(tag);
		if (classes != null) {
			classes.split().forEach((clas) => elem.classList.add(clas));
		}
		if (attrs != null) {
			for (let [name, value] of Object.entries(attrs)) {
				elem.setAttribute(name, value);
			}
		}
		if (text != null) {
			elem.innerText = text;
		}
		return elem;
	},


	/** Removes all the children elements from an HTML element. */
	removeAllChildren : function(element) {
		while (element.firstChild) {
			element.removeChild(element.lastChild);
		}
	},


	dbNames : {
		suppliers: 'suppliers',
		suplrId:   'supplier_id',
		suplrName: 'supplier_name',
		email:     'email_address',
		phone:     'phone_number',

		products: 'products',
		prodId:   'product_id',
		prodName: 'product_name',
		minQuant: 'min_quantity',
		quant:    'quantity',
		maxQuant: 'max_quantity',

		orders: 'orders'
	},


	firestore : null,
	getDatabase : function() {
		if (! this.firestore) {
			const firebaseConfig = {
				apiKey: "AIzaSyCfNIMZrAEwzQh0hlw_LS9Kfp2c9-tmlI4",
				authDomain: "min-max-inventory-fe941.firebaseapp.com",
				projectId: "min-max-inventory-fe941",
				storageBucket: "min-max-inventory-fe941.appspot.com",
				messagingSenderId: "273249135506",
				appId: "1:273249135506:web:e61b4af78ee1dae30e6f4b"
			};
			const app = initializeApp(firebaseConfig);
			this.firestore = getFirestore(app);
		}
		return this.firestore;
	},


	getCollection : function(path, cache, listeners) {
		const db = this.getDatabase();
		const unsubscribe = onSnapshot(fireCollect(db, path),
			(snapshot) => {
				snapshot.docChanges().forEach((change) => {
					const docId = change.doc.id;
					const docData = change.doc.data();
					switch (change.type) {
						case 'added':
							cache[docId] = docData;
							listeners.forEach((listener) =>
									listener.addOne(docId, docData));
							break;
						case 'modified':
							cache[docId] = docData;
							listeners.forEach((listener) =>
									listener.modifyOne(docId, docData));
							break;
						case 'removed':
							delete cache[docId];
							listeners.forEach((listener) =>
									listener.removeOne(docId));
							break;
						default:
							break;
					}
				});
			});
	},


	addDocument : function(path, object) {
		const db = this.getDatabase();
		addDoc(fireCollect(db, path), object);
	},


	updateDocument : function(path, docId, object) {
		const db = this.getDatabase();
		updateDoc(fireDoc(db, path, docId), object);
	}
};


/** The functions in this object are "inherited" in the objects
 * below. This is a somewhat unusual way to acheive code reuse. */
const prototype = {
	prepare : function() {
		this.listen(this);
	},


	listen : function(listener) {
		for (const [docId, docData] of Object.entries(this.cache)) {
			listener.addOne(docId, docData);
		}
		this.listeners.push(listener);
	},


	disregard : function(listener) {
		const index = this.listeners.indexOf(listener);
		if (index != -1) {
			this.listeners.splice(index, 1);
		}
	},


	removeOne : function(docId) {
		const row = this.getRow(docId);
		if (row) {
			tbody.removeChild(row);
		}
	},

	getRow : function(prodId) {
		const names = mminv.dbNames;
		const tbody = this.getTableBody();
		const column = tbody.querySelectorAll(`td[name="${names.prodId}"]`);
		const cellId = Array.from(column)
				.find((elem) => elem.innerText == prodId);
		return cellId.closest('tr');
	},


	empty : function() {
		this.disregard(this);

		// Remove all the rows from the table.
		mminv.removeAllChildren(this.getTableBody());
	},
};


const suppliers = {
	divId : 'suppliers',
	cache : { },
	listeners : [ ],


	init : function() {
		const path = mminv.dbNames.suppliers;
		mminv.getCollection(path, this.cache, this.listeners);
	},


	prepare   : prototype.prepare,

	listen    : prototype.listen,
	disregard : prototype.disregard,


	addOne : function(suplrId, suplrData) {
		const names = mminv.dbNames;
		const create = mminv.createElem;
		const cellId = create('td', null, null, suplrId);

		const suplrName = suplrData[names.suplrName];
		const cellName = create('td', null, {name:names.suplrName}, suplrName);

		const suplrEmail = suplrData[names.email]
		const cellEmail = create('td', null, {name:names.suplrEmail}, suplrEmail);

		const suplrPhone = suplrData[names.phone]
		const cellPhone = create('td', null, {name:names.suplrPhone}, suplrPhone);

		const row = create('tr');
		row.appendChild(cellId);
		row.appendChild(cellName);
		row.appendChild(cellEmail);
		row.appendChild(cellPhone);

		const tbody = this.getTableBody();
		tbody.appendChild(row);
	},

	modifyOne : function(suplrId, suplrData) {
		const row = this.getRow(suplrId);
		if (row) {
			const names = mminv.dbNames;
			[names.suplrName, names.suplrEmail, names.suplrPhone]
				.forEach((name) => {
					const cell = row.querySelector(`td[name="${name}"]`);
					cell.innerText = suplrData[name];
				});
		}
	},

	removeOne : prototype.removeOne,

	getRow : function(suplrId) {
		const names = mminv.dbNames;
		const tbody = this.getTableBody();
		const column = tbody.querySelectorAll(`td[name="${names.suplrId}"]`);
		const cellId = Array.from(column)
				.find((elem) => elem.innerText == suplrId);
		const row = cellId.closest('tr');
	},


	empty : prototype.empty,

	getTableBody : function() {
		return document.querySelector(`#${this.divId} > table > tbody`);
	},


	order : function(orders) {
		const names = mminv.dbNames;
		for (const [suplrId, products] of Object.entries(orders)) {
			const order = { };
			order[names.suplrId] = suplrId;
			order[names.products] = products;
			mminv.addDocument(names.orders, order);
		}

		let str = '';
		for (const [suplrId, order] of Object.entries(orders)) {
			str += suplrId + ':\n';
			for (const [prodId, quant] of Object.entries(order)) {
				str += '    ' + prodId + ': ' + quant + '\n';
			}
		}
		window.alert(str);
	}
};



const products = {
	divId : 'products',
	cache : { },
	listeners : [ ],


	init : function() {
		const path = mminv.dbNames.products;
		mminv.getCollection(path, this.cache, this.listeners);
	},


	prepare   : prototype.prepare,

	listen    : prototype.listen,
	disregard : prototype.disregard,

	getProduct : function(prodId) { return this.cache[prodId]; },

	addOne : function(prodId, prodData) {
		const names = mminv.dbNames;
		const create = mminv.createElem;
		const cellId = create('td', null, {name:names.prodId}, prodId);

		const prodName = prodData[names.prodName];
		const cellName = create('td', null, {name:names.prodName}, prodName);

		const minQuant = prodData[names.minQuant]
		const cellMinQuant = create('td', 'number', {name:names.minQuant}, minQuant);

		const quant = prodData[names.quant]
		const cellQuant = create('td', 'number', {name:names.quant}, quant);

		const maxQuant = prodData[names.maxQuant]
		const cellMaxQuant = create('td', 'number', {name:names.maxQuant}, maxQuant);

		const suplrId = prodData[names.suplrId]
		const cellSuplrId = create('td', null, {name:names.suplrId}, suplrId);

		const row = create('tr');
		row.appendChild(cellId);
		row.appendChild(cellName);
		row.appendChild(cellMinQuant);
		row.appendChild(cellQuant);
		row.appendChild(cellMaxQuant);
		row.appendChild(cellSuplrId);

		const tbody = this.getTableBody();
		tbody.appendChild(row);
	},

	modifyOne : function(prodId, prodData) {
		const row = this.getRow(prodId);
		if (row) {
			const names = mminv.dbNames;
			[names.prodName, names.minQuant, names.quant,
				names.maxQuant, names.suprlId]
				.forEach((name) => {
					const cell = row.querySelector(`td[name="${name}"]`);
					cell.innerText = prodData[name];
				});
		}
	},

	removeOne : prototype.removeOne,
	getRow    : prototype.getRow,


	empty : prototype.empty,

	getTableBody : function() {
		return document.querySelector(`#${this.divId} > table > tbody`);
	}
};


const receiving = {
	divId : 'receiving',

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
		products.listen(this);
	},


	addOne : function(prodId, prodData) {
		const names = mminv.dbNames;
		const create = mminv.createElem;
		const cellId = create('td', null, {name:names.prodId}, prodId);

		const prodName = prodData[names.prodName];
		const cellName = create('td', null, {name:names.prodName}, prodName);

		const quant = prodData[names.quant];
		const cellQuant = create('td', 'number', {name:names.quant}, quant);

		const input = create('input', null, {type:'number', name:'received',
				min:0, step:1, pattern:'^(0|[1-9][0-9]*)$'});
		const cellReceived = create('td');
		cellReceived.appendChild(input);

		const row = create('tr');
		row.appendChild(cellId);
		row.appendChild(cellName);
		row.appendChild(cellQuant);
		row.appendChild(cellReceived);

		const tbody = this.getTableBody();
		tbody.appendChild(row);
	},

	modifyOne : function(prodId, prodData) {
		const row = this.getRow(prodId);
		if (row) {
			const names = mminv.dbNames;
			[names.prodName, names.quant]
				.forEach((name) => {
					const cell = row.querySelector(`td[name="${name}"]`);
					cell.innerText = prodData[name];
				});
		}
	},

	removeOne : prototype.removeOne,
	getRow    : prototype.getRow,


	submit : function(event) {
		const updates = this.validate();
		if (updates) {
			const names = mminv.dbNames;
			const object = { };
			for (const [prodId, received] of Object.entries(updates)) {
				const prodData = products.getProduct(prodId);

				// Compute a new quantity by adding the received quantity.
				let quant = prodData[names.quant];
				quant += received;

				// Update the Firestore document. This update should
				// cause Firestore to send an update back to this
				// program which will be received and processed in the
				// onSnapshot closure in mminv.getCollection.
				object[names.quant] = quant;
				mminv.updateDocument(names.products, prodId, object);
			}

			// Clear the inputs in this fragment.
			this.clear();
		}
	},


	validate : function() {
		const names = mminv.dbNames;
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
		products.disregard(this);

		// Remove all the rows from the receiving table.
		mminv.removeAllChildren(this.getTableBody());
	},


	getTableBody : function() {
		return document.querySelector(`#${this.divId} > form > table > tbody`);
	}
};


const outgoing = {
	divId : 'outgoing',

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
		products.listen(this);
	},


	addOne : function(prodId, prodData) {
		const names = mminv.dbNames;
		const create = mminv.createElem;
		const cellId = create('td', null, {name:names.prodId}, prodId);

		const prodName = prodData[names.prodName];
		const cellName = create('td', null, {name:names.prodName}, prodName);

		const quant = prodData[names.quant];
		const cellQuant = create('td', 'number', {name:names.quant}, quant);

		const input = create('input', null, {type:'number', name:'issued',
				min:0, max:quant, step:1, pattern:'^(0|[1-9][0-9]*)$'});
		const cellIssued = create('td');
		cellIssued.appendChild(input);

		const row = create('tr');
		row.appendChild(cellId);
		row.appendChild(cellName);
		row.appendChild(cellQuant);
		row.appendChild(cellIssued);

		const tbody = this.getTableBody();
		tbody.appendChild(row);
	},

	modifyOne : function(prodId, prodData) {
		const row = this.getRow(prodId);
		if (row) {
			const names = mminv.dbNames;
			[names.prodName, names.quant]
				.forEach((name) => {
					const cell = row.querySelector(`td[name="${name}"]`);
					cell.innerText = prodData[name];
				});
		}
	},

	removeOne : prototype.removeOne,
	getRow    : prototype.getRow,


	submit : function(event) {
		const updates = this.validate();
		if (updates) {
			const names = mminv.dbNames;
			const tbody = this.getTableBody();
			const object = { };
			const orders = { };
			for (const [prodId, issued] of Object.entries(updates)) {
				const prodData = products.getProduct(prodId);

				// Compute a new quantity by subtracting the issued quantity.
				let quant = prodData[names.quant];
				quant -= issued;

				// Update the Firestore document. This update should
				// cause Firestore to send an update back to this
				// program which will be received and processed in the
				// onSnapshot closure in mminv.getCollection().
				object[names.quant] = quant;
				mminv.updateDocument(names.products, prodId, object);

				// If a new quantity falls below its minimum quantity,
				// create an order for enough product to raise the
				// quantity to its maximum (max_quantity - quantity).
				const minQuant = prodData[names.minQuant];
				if (quant < minQuant) {
					const maxQuant = prodData[names.maxQuant];
					const suplrId = prodData[names.suplrId];
					if (! (suplrId in orders)) {
						orders[suplrId] = { };
					}
					const order = orders[suplrId];
					order[prodId] = maxQuant - quant;
				}
			}

			if (Object.keys(orders).length > 0) {
				suppliers.order(orders);
			}

			// Clear the inputs in this fragment.
			this.clear();
		}
	},


	validate : function() {
		const names = mminv.dbNames;
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
					// Get the product_id from the current row.
					const row = input.closest('tr');
					const cell= row.querySelector(`td[name="${names.prodId}"]`);
					const prodId = cell.innerText;

					// Verify that the issued amount is less
					// than or equal to the quantity in stock.
					const quant = products.getProduct(prodId)[names.quant];
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
		products.disregard(this);

		// Remove all the rows from the outgoing table.
		mminv.removeAllChildren(this.getTableBody());
	},


	getTableBody : function() {
		return document.querySelector(`#${this.divId} > form > table > tbody`);
	}
};


document.addEventListener('DOMContentLoaded', (event) => mminv.init(event));
