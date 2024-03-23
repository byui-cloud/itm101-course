import {initializeApp} from
	'https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js';
import {getFirestore, collection as fireCollect, onSnapshot,
		doc as fireDoc, addDoc, updateDoc, serverTimestamp}
	from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js';


/** The check object contains functions to check parameter types. */
const check = {
	HTMLElement : function(value) {
		return value instanceof HTMLElement;
	},

	object : function(value) {
		return typeof value === 'object';
	},

	array : function(value) {
		return Array.isArray(value);
	},

	func : function(value) {
		return typeof value === 'function';
	},


	primitive : function(value) {
		const type = typeof value;
		return type === 'string' || type === 'number' ||
			type === 'boolean' || type === 'bigint';
	},


	string : function(value) {
		return typeof value === 'string';
	},


	number : function(value) {
		return typeof value === 'number';
	},

	integer : function(value) {
		return Number.isInteger(value);
	},

	between : function(value, min, max) {
		return min <= value && value <= max
	},


	nothing : function(value) {
		return typeof value === 'undefined' || value === null;
	},

	nul : function(value) {
		return value === null;
	},

	undef : function(value) {
		return typeof value === 'undefined';
	}
};


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

		/*
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
		*/

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
		console.assert(check.string(tag));
		console.assert(check.string(classes) || check.nothing(classes));
		console.assert(check.object(attrs) || check.nothing(attrs));
		console.assert(check.primitive(text) || check.nothing(text));
		const elem = document.createElement(tag);
		if (classes) {
			classes.split().forEach((clas) => elem.classList.add(clas));
		}
		if (attrs) {
			for (let [name, value] of Object.entries(attrs)) {
				elem.setAttribute(name, value);
			}
		}
		if (check.nothing(text) === false) {
			elem.innerText = text;
		}
		console.assert(check.HTMLElement(elem));
		return elem;
	},


	/** Removes all the children elements from an HTML element. */
	removeAllChildren : function(element) {
		console.assert(check.HTMLElement(element));
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

		orders:    'orders',
		orderDate: 'order_date'
	},


	firestore : null,
	getDatabase : function() {
		if (! this.firestore) {
			const firebaseConfig = {
				apiKey: 'AIzaSyCfNIMZrAEwzQh0hlw_LS9Kfp2c9-tmlI4',
				authDomain: 'min-max-inventory-fe941.firebaseapp.com',
				projectId: 'min-max-inventory-fe941',
				storageBucket: 'min-max-inventory-fe941.appspot.com',
				messagingSenderId: '273249135506',
				appId: '1:273249135506:web:e61b4af78ee1dae30e6f4b'
			};
			const app = initializeApp(firebaseConfig);
			this.firestore = getFirestore(app);
		}
		return this.firestore;
	},


	getCollection : function(path, cache, listeners) {
		console.assert(check.string(path));
		console.assert(check.object(cache));
		console.assert(check.array(listeners));
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
		console.assert(check.string(path));
		console.assert(check.object(object));
		const db = this.getDatabase();
		addDoc(fireCollect(db, path), object);
	},


	updateDocument : function(path, docId, object) {
		console.assert(check.string(path));
		console.assert(check.string(docId));
		console.assert(check.object(object));
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

	prepareSubordinate : function() {
		products.listen(this);
	},


	listen : function(listener) {
		console.assert(check.object(listener));
		for (const [docId, docData] of Object.entries(this.cache)) {
			listener.addOne(docId, docData);
		}
		this.listeners.push(listener);
	},

	disregard : function(listener) {
		console.assert(check.object(listener));
		const index = this.listeners.indexOf(listener);
		if (index != -1) {
			this.listeners.splice(index, 1);
		}
	},


	insertRow : function(tbody, toInsert, sortKeyFunc) {
		console.assert(check.HTMLElement(tbody));
		console.assert(check.HTMLElement(toInsert));
		console.assert(check.func(sortKeyFunc));
		const key = sortKeyFunc(toInsert);
		const rows = Array.from(tbody.children);
		const existing = rows.find((row) => key <= sortKeyFunc(row));
		tbody.insertBefore(toInsert, existing);
	},


	removeOne : function(docId) {
		console.assert(check.string(docId));
		const row = this.getRow(docId);
		if (row) {
			tbody.removeChild(row);
		}
	},


	makeGetRow : function(colName) {
		console.assert(check.string(colName));
		return function(docId) {
			const names = mminv.dbNames;
			const tbody = this.getTableBody();
			const column = tbody.querySelectorAll(`td[name="${colName}"]`);
			const cellId = Array.from(column)
					.find((elem) => elem.innerText == docId);
			const row = cellId.closest('tr');
			console.assert(check.HTMLElement(row));
			return row;
		};
	},


	makeStrKeyFunc : function(name) {
		console.assert(check.string(name));
		return function(row) {
			console.assert(check.HTMLElement(row));
			const cell = row.querySelector(`td[name="${name}"]`);
			return cell.innerText;
		};
	},

	makeNumKeyFunc : function(name) {
		console.assert(check.string(name));
		return function(row) {
			console.assert(check.HTMLElement(row));
			const cell = row.querySelector(`td[name="${name}"]`);
			return parseInt(cell.innerText);
		};
	},

	makeInputKeyFunc : function(name) {
		console.assert(check.string(name));
		return function(row) {
			console.assert(check.HTMLElement(row));
			const input = row.querySelector(`td > input[name="${name}"]`);
			const value = input.value;
			return value === '' ? 0 : parseInt(value);
		};
	},


	sortRows : function(event) {
		const name = event.target.getAttribute('name');
		const keyFunc = this.keyFuncs[name];
		this.keyFunc = keyFunc;

		function compareRows(row1, row2) {
			const text1 = keyFunc(row1);
			const text2 = keyFunc(row2);
			let result = 0;
			if (text1 < text2) {
				result = -1;
			}
			else if (text1 > text2) {
				result = 1;
			}
			return result;
		}

		const tbody = this.getTableBody();
		Array.from(tbody.children)
			.sort(compareRows)
			.forEach((row) => tbody.appendChild(row));
	},


	empty : function() {
		this.disregard(this);

		// Remove all the rows from the table.
		mminv.removeAllChildren(this.getTableBody());
	},

	emptySubordinate : function() {
		products.disregard(this);

		// Remove all the rows from the table.
		mminv.removeAllChildren(this.getTableBody());
	}
};


const suppliers = {
	divId : 'suppliers',
	cache : { },
	listeners : [ ],
	keyFuncs : { },
	keyFunc : null,


	init : function() {
		const names = mminv.dbNames;
		const keyFuncs = this.keyFuncs;
		keyFuncs[names.suplrId]   = prototype.makeStrKeyFunc(names.suplrId);
		keyFuncs[names.suplrName] = prototype.makeStrKeyFunc(names.suplrName);
		keyFuncs[names.email]     = prototype.makeStrKeyFunc(names.email);
		keyFuncs[names.phone]     = prototype.makeStrKeyFunc(names.phone);
		this.keyFunc = keyFuncs[names.suplrName];

		[names.suplrId, names.suplrName, names.email, names.phone]
			.forEach((name) => {
				console.assert(check.string(name));
				const cell = document.querySelector(
					`#${this.divId} thead > tr > th[name="${name}"]`);
				cell.addEventListener('click', (event) => this.sortRows(event));
			});

		this.listen(this);
		mminv.getCollection(names.suppliers, this.cache, this.listeners);
	},


	prepare : prototype.prepare,

	listen    : prototype.listen,
	disregard : prototype.disregard,


	addOne : function(suplrId, suplrData) {
		console.assert(check.string(suplrId));
		console.assert(check.object(suplrData));

		const names = mminv.dbNames;
		const create = mminv.createElem;
		const cellId = create('td', null, {name:names.suplrId}, suplrId);

		const suplrName = suplrData[names.suplrName];
		const cellName = create('td', null, {name:names.suplrName}, suplrName);

		const email = suplrData[names.email]
		const cellEmail = create('td', null, {name:names.email}, email);

		const phone = suplrData[names.phone]
		const cellPhone = create('td', null, {name:names.phone}, phone);

		const row = create('tr');
		row.appendChild(cellId);
		row.appendChild(cellName);
		row.appendChild(cellEmail);
		row.appendChild(cellPhone);

		const tbody = this.getTableBody();
		prototype.insertRow(tbody, row, this.keyFunc);
	},


	modifyOne : function(suplrId, suplrData) {
		console.assert(check.string(suplrId));
		console.assert(check.object(suplrData));
		const row = this.getRow(suplrId);
		if (row) {
			const names = mminv.dbNames;
			[names.suplrName, names.email, names.phone]
				.forEach((name) => {
					console.assert(check.string(name));
					const cell = row.querySelector(`td[name="${name}"]`);
					cell.innerText = suplrData[name];
				});
		}
	},

	removeOne : prototype.removeOne,

	sortRows : prototype.sortRows,
	getRow : prototype.makeGetRow(mminv.dbNames.suplrId),

	empty : prototype.empty,

	getTableBody : function() {
		return document.querySelector(`#${this.divId} > table > tbody`);
	},


	order : function(orders) {
		console.assert(check.object(orders));
		const names = mminv.dbNames;
		for (const [suplrId, products] of Object.entries(orders)) {
			const order = { };
			order[names.suplrId] = suplrId;
			order[names.products] = products;
			order[names.orderDate] = serverTimestamp();
			mminv.addDocument(names.orders, order);
		}

		let str = '';
		for (const [suplrId, order] of Object.entries(orders)) {
			const suplrData = this.cache[suplrId];
			str += 'Order to ' + suplrData[names.suplrName] + ' ' +
				suplrData[names.email] + ':\n';
			for (const [prodId, quant] of Object.entries(order)) {
				const prodData = products.getProduct(prodId);
				str += '    ' + prodId + ' ' + prodData[names.prodName] +
					': ' + quant + '\n';
			}
		}
		window.alert(str);
	}
};


const products = {
	divId : 'products',
	cache : { },
	listeners : [ ],
	keyFuncs : { },
	keyFunc : null,


	init : function() {
		const names = mminv.dbNames;
		const keyFuncs = this.keyFuncs;
		keyFuncs[names.prodId]   = prototype.makeStrKeyFunc(names.prodId);
		keyFuncs[names.prodName] = prototype.makeStrKeyFunc(names.prodName);
		keyFuncs[names.minQuant] = prototype.makeNumKeyFunc(names.minQuant);
		keyFuncs[names.quant]    = prototype.makeNumKeyFunc(names.quant);
		keyFuncs[names.maxQuant] = prototype.makeNumKeyFunc(names.maxQuant);
		keyFuncs[names.suplrId]  = prototype.makeStrKeyFunc(names.suplrId);
		this.keyFunc = keyFuncs[names.prodName];

		[names.prodId, names.prodName, names.minQuant,
		 names.quant, names.maxQuant, names.suplrId]
			.forEach((name) => {
				console.assert(check.string(name));
				const cell = document.querySelector(
					`#${this.divId} thead > tr > th[name="${name}"]`);
				cell.addEventListener('click', (event) => this.sortRows(event));
			});

		this.listen(this);
		mminv.getCollection(names.products, this.cache, this.listeners);
	},


	prepare : prototype.prepare,

	listen    : prototype.listen,
	disregard : prototype.disregard,

	getProduct : function(prodId) { return this.cache[prodId]; },


	addOne : function(prodId, prodData) {
		console.assert(check.string(prodId));
		console.assert(check.object(prodData));

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
		prototype.insertRow(tbody, row, this.keyFunc);
	},


	modifyOne : function(prodId, prodData) {
		console.assert(check.string(prodId));
		console.assert(check.object(prodData));
		const row = this.getRow(prodId);
		if (row) {
			const names = mminv.dbNames;
			[names.prodName, names.minQuant, names.quant,
			 names.maxQuant, names.suplrId]
				.forEach((name) => {
					console.assert(check.string(name));
					const cell = row.querySelector(`td[name="${name}"]`);
					cell.innerText = prodData[name];
				});
		}
	},

	removeOne : prototype.removeOne,

	sortRows : prototype.sortRows,
	getRow : prototype.makeGetRow(mminv.dbNames.prodId),

	empty : prototype.empty,

	getTableBody : function() {
		return document.querySelector(`#${this.divId} > table > tbody`);
	}
};


const receiving = {
	divId : 'receiving',
	keyFuncs : { },
	keyFunc : null,


	init : function() {
		const names = mminv.dbNames;
		const keyFuncs = this.keyFuncs;
		keyFuncs[names.prodId]   = prototype.makeStrKeyFunc(names.prodId);
		keyFuncs[names.prodName] = prototype.makeStrKeyFunc(names.prodName);
		keyFuncs[names.quant]    = prototype.makeNumKeyFunc(names.quant);
		keyFuncs['received']     = prototype.makeInputKeyFunc('received');
		this.keyFunc = keyFuncs[names.prodName];

		[names.prodName, names.quant, 'received']
			.forEach((name) => {
				console.assert(check.string(name));
				const cell = document.querySelector(
					`#${this.divId} thead > tr > th[name="${name}"]`);
				cell.addEventListener('click', (event) => this.sortRows(event));
			});

		const self = this;
		const ctrls = document.querySelector(`#${this.divId} > div.controls`);
		const pairs = [
			['submit', (event) => self.submit(event)],
			['clear', (event) => self.clear(event)]
		];
		pairs.forEach((pair) => {
			const [name, func] = pair;
			console.assert(check.string(name));
			console.assert(check.func(func));
			const button = ctrls.querySelector(`button[name="${name}"]`);
			button.addEventListener('click', func);
		});

		products.listen(this);
	},


	prepare : prototype.prepareSubordinate,


	addOne : function(prodId, prodData) {
		console.assert(check.string(prodId));
		console.assert(check.object(prodData));

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
		prototype.insertRow(tbody, row, this.keyFunc);
	},


	modifyOne : function(prodId, prodData) {
		console.assert(check.string(prodId));
		console.assert(check.object(prodData));
		const row = this.getRow(prodId);
		if (row) {
			const names = mminv.dbNames;
			[names.prodName, names.quant]
				.forEach((name) => {
					console.assert(check.string(name));
					const cell = row.querySelector(`td[name="${name}"]`);
					cell.innerText = prodData[name];
				});
		}
	},

	removeOne : prototype.removeOne,

	sortRows : prototype.sortRows,
	getRow : prototype.makeGetRow(mminv.dbNames.prodId),


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

	empty : prototype.emptySubordinate,


	getTableBody : function() {
		return document.querySelector(`#${this.divId} > form > table > tbody`);
	}
};


const outgoing = {
	divId : 'outgoing',
	keyFuncs : { },
	keyFunc : null,


	init : function() {
		const names = mminv.dbNames;
		const keyFuncs = this.keyFuncs;
		keyFuncs[names.prodId]   = prototype.makeStrKeyFunc(names.prodId);
		keyFuncs[names.prodName] = prototype.makeStrKeyFunc(names.prodName);
		keyFuncs[names.quant]    = prototype.makeNumKeyFunc(names.quant);
		keyFuncs['outgoing']     = prototype.makeInputKeyFunc('outgoing');
		this.keyFunc = keyFuncs[names.prodName];

		[names.prodName, names.quant, 'outgoing']
			.forEach((name) => {
				console.assert(check.string(name));
				const cell = document.querySelector(
					`#${this.divId} thead > tr > th[name="${name}"]`);
				cell.addEventListener('click', (event) => this.sortRows(event));
			});


		const self = this;
		const ctrls = document.querySelector(`#${this.divId} > div.controls`);
		const pairs = [
			['submit', (event) => self.submit(event)],
			['clear',  (event) => self.clear(event)]
		];
		pairs.forEach((pair) => {
			const [name, func] = pair;
			console.assert(check.string(name));
			console.assert(check.func(func));
			const button = ctrls.querySelector(`button[name="${name}"]`);
			button.addEventListener('click', func);
		});

		products.listen(this);
	},


	prepare : prototype.prepareSubordinate,


	addOne : function(prodId, prodData) {
		console.assert(check.string(prodId));
		console.assert(check.object(prodData));

		const names = mminv.dbNames;
		const create = mminv.createElem;
		const cellId = create('td', null, {name:names.prodId}, prodId);

		const prodName = prodData[names.prodName];
		const cellName = create('td', null, {name:names.prodName}, prodName);

		const quant = prodData[names.quant];
		const cellQuant = create('td', 'number', {name:names.quant}, quant);

		const input = create('input', null, {type:'number', name:'outgoing',
				min:0, max:quant, step:1, pattern:'^(0|[1-9][0-9]*)$'});
		const cellIssued = create('td');
		cellIssued.appendChild(input);

		const row = create('tr');
		row.appendChild(cellId);
		row.appendChild(cellName);
		row.appendChild(cellQuant);
		row.appendChild(cellIssued);

		const tbody = this.getTableBody();
		prototype.insertRow(tbody, row, this.keyFunc);
	},


	modifyOne : function(prodId, prodData) {
		console.assert(check.string(prodId));
		console.assert(check.object(prodData));
		const row = this.getRow(prodId);
		if (row) {
			const names = mminv.dbNames;
			[names.prodName, names.quant]
				.forEach((name) => {
					console.assert(check.string(name));
					const cell = row.querySelector(`td[name="${name}"]`);
					cell.innerText = prodData[name];
				});

			const input = row.querySelector('td > input[name="outgoing"]');
			input.setAttribute('max', prodData[names.quant]);
		}
	},

	removeOne : prototype.removeOne,

	sortRows : prototype.sortRows,
	getRow : prototype.makeGetRow(mminv.dbNames.prodId),


	submit : function(event) {
		const updates = this.validate();
		if (updates) {
			const names = mminv.dbNames;
			const tbody = this.getTableBody();
			const object = { };
			const orders = { };
			for (const [prodId, outgoing] of Object.entries(updates)) {
				const prodData = products.getProduct(prodId);

				// Compute a new quantity by subtracting the outgoing quantity.
				let quant = prodData[names.quant];
				quant -= outgoing;

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
		const inputs = tbody.querySelectorAll('input[name="outgoing"]');
		const allValid = Array.from(inputs).every((input) => {
			let valid = true;
			const value = input.value;
			if (value != '') {
				// Verify that the user entered a non-negative integer.
				const outgoing = parseInt(value);
				valid = (!isNaN(outgoing) && outgoing >= 0 &&
						Math.abs(outgoing - parseFloat(value)) == 0);
				if (valid) {
					// Get the product_id from the current row.
					const row = input.closest('tr');
					const cell= row.querySelector(`td[name="${names.prodId}"]`);
					const prodId = cell.innerText;

					// Verify that the outgoing amount is less
					// than or equal to the quantity in stock.
					const quant = products.getProduct(prodId)[names.quant];
					valid = (outgoing <= quant);
					if (valid) {
						updates[prodId] = outgoing;
					}
				}
			}
			return valid;
		});
		return allValid ? updates : null;
	},


	clear : function(event) {
		const tbody = this.getTableBody();
		const inputs = tbody.querySelectorAll('input[name="outgoing"]');
		Array.from(inputs).forEach((input) => input.value = '');
	},

	empty : prototype.emptySubordinate,


	getTableBody : function() {
		return document.querySelector(`#${this.divId} > form > table > tbody`);
	}
};


document.addEventListener('DOMContentLoaded', (event) => mminv.init(event));
