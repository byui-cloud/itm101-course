// Import the Google Firebase and Firestore functions
// needed by this Min-Max Inventory System.
import {initializeApp} from
	'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';
import {getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithRedirect}
	from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';
import {getFirestore, collection as fireCollect, onSnapshot,
		doc as fireDoc, addDoc, Timestamp}
	from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';


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


const monthAbbrevs = [
	'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
	'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function yyyymonddFromTimestamp(timestamp) {
	const date = timestamp.toDate();
	const year = date.getFullYear();
	const month = monthAbbrevs[date.getMonth()];
	const day = date.getDate().toString().padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function yyyymmddFromDate(date) {
	const year = date.getFullYear();
	const m = date.getMonth() + 1;
	const month = m.toString().padStart(2, '0');
	const day = date.getDate().toString().padStart(2, '0');
	return `${year}-${month}-${day}`;
}


/** Creates an HTML element. */
function createElement(tag, classes, attrs, text) {
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
	if (typeof text !== 'undefined' && text !== null) {
		elem.innerText = text;
	}
	console.assert(check.HTMLElement(elem));
	return elem;
}


/** Removes all the children elements from an HTML element. */
function removeAllChildren(element) {
	console.assert(check.HTMLElement(element));
	while (element.firstChild) {
		element.removeChild(element.lastChild);
	}
}


const app = {
	/** Names of collections and document properties
	 * within the Firestore database. */
	dbNames : {
		employees:  'employees',
		employeeId: 'employee_id',
		givenName:  'given_name',
		familyName: 'family_name',
		email:      'email_address',
		role:       'role',

		expenses:  'expenses',
		expenseId: 'expense_id',
		datePaid:  'date_paid',
		payee:     'payee',
		amount:    'amount',
		purpose:   'purpose'
	},


	/** A reference to this app's connection to the Firestore database. */
	firestore : null,
	user : null,

	authenticate : function(event) {
		const self = this;
		if (! self.firestore) {
			/* Copy and paste your project's firebaseConfig here. */
			// Your web app's Firebase configuration
			const firebaseConfig = {
				apiKey: "AIzaSyCT5lj73NBjr6wtfyfs9Hoj-tPLIx0Qc5E",
				authDomain: "barzee-expenses-5481f.firebaseapp.com",
				projectId: "barzee-expenses-5481f",
				storageBucket: "barzee-expenses-5481f.appspot.com",
				messagingSenderId: "1004987058283",
				appId: "1:1004987058283:web:0e987c18eb06de6aca892e"
			};
			const app = initializeApp(firebaseConfig);

			// Use the Google authentication service.
			const auth = getAuth(app);
			onAuthStateChanged(auth, (user) => {
				if (user) {
					// The user is signed in so connect to the database.
					self.firestore = getFirestore(app);

					// Initizlize the HTML user interface.
					self.initialize(user);
				}
				else {
					// The user is not signed in so use the Google
					// authentication service to sign in the user.
					const provider = new GoogleAuthProvider();
					signInWithRedirect(auth, provider)
					.then((result) => {
						const user = result.user;
						console.log(`${user.displayName} successfully signed in`);
						// Because sign in was successful, the browser should
						// call the anonymous auth state changed function
						// again, but this time the user parameter will have
						// a value which will cause the browser to execute
						// the code above to connect to the database and
						// initialize the HTML user interface.
					})
					.catch((error) => {
						console.error(error.code);
						console.error(error.message)
					});
				}
			});
		}
	},


	initialize : function(user) {
		this.user = user;

		// Display the user's information.
		document.querySelector('div.user > .name').innerText = user.displayName;
		document.querySelector('div.user > .email').innerText = user.email;
		document.querySelector('div.user > .id').innerText = user.uid;
		document.querySelector('div.user > .photo').src = user.photoURL;

		form.initialize();
		table.initialize(user);
	},


	expensesPath : function() {
		const names = this.dbNames;
		const user = this.user;
		return `${names.employees}/${user.uid}/${names.expenses}`;
	},


	/** Begins listening to a Firestore collection for
	 * changes to the documents within that collection. */
	getCollection : function(path, cache, listeners) {
		console.assert(check.string(path));
		console.assert(check.object(cache));
		console.assert(check.array(listeners));
		const db = this.firestore;
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
			},
			(error) => {
				console.error(error.code);
				console.error(error.message);
			});
	},


	/** Adds a document to a Firestore collection. */
	addDocument : function(path, object) {
		console.assert(check.string(path));
		console.assert(check.object(object));
		const db = this.firestore;
		addDoc(fireCollect(db, path), object);
	}
};


const form = {
	initialize : function() {
		// Set some minimum and maximum values in the expense form.
		const datePaid = document.getElementById('date_paid');
		const today = new Date();
		const thirtyDays = 30 * 24 * 60 * 60 * 1000;
		const prev30Days = new Date(today.getTime() - thirtyDays);
		datePaid.min = yyyymmddFromDate(prev30Days);
		datePaid.max = yyyymmddFromDate(today);

		// Add an event listener to the Submit and Clear buttons.
		const form = document.getElementById('expense_form');
		const submit = form.querySelector('button[name="submit"]');
		const clear = form.querySelector('button[name="clear"]');
		const self = this;
		submit.addEventListener('click', (event) => self.submit(event));
		clear.addEventListener('click', (event) => form.reset());
	},


	/** If the user entered valid data in the expense form,
	 * add the expense to the Firestore database. */
	submit : function(event) {
		if (this.validate()) {
			// Get the data that the user entered for an expense.
			const names = app.dbNames;
			const datePaid = document.getElementById(names.datePaid);
			const payee = document.getElementById(names.payee);
			const amount = document.getElementById(names.amount);
			const purpose = document.getElementById(names.purpose);
			const object = {}
			object[names.datePaid] = Timestamp.fromDate(new Date(datePaid.value));
			object[names.payee] = payee.value;
			object[names.amount] = Math.round(parseFloat(amount.value) * 100);
			object[names.purpose] = purpose.value;

			// Add a document to the Firestore database. Adding should
			// cause Firestore to send an added event back to this
			// program which will be received and processed in the
			// onSnapshot closure in app.getCollection.
			app.addDocument(app.expensesPath(), object);

			// Clear the inputs in this section.
			const form = document.getElementById('expense_form');
			form.reset();
		}
	},


	validate : function(event) {
		let valid = true;
		['date_paid', 'payee', 'amount', 'purpose'].forEach((id) => {
			const input = document.getElementById(id);
			valid &&= input.checkValidity();
		});
		return valid;
	}
};


const table = {
	cache : {},
	compareFuncs : {},
	compareFunc : null,


	initialize : function(user) {
		const names = app.dbNames;
		const cache = this.cache;
		const compareFuncs = this.compareFuncs;

		function getExpenseData(tr) {
			const td = tr.querySelector(`td[data-name="${names.expenseId}"]`);
			const expenseId = td.innerText;
			return cache[expenseId];
		}

		// Create comparison functions that are used to sort the
		// expenses table when a user clicks one of the column headings.
		compareFuncs[names.datePaid] = (tr1, tr2) => {
			const data1 = getExpenseData(tr1);
			const data2 = getExpenseData(tr2);
			const datePaid1 = data1[names.datePaid].toDate().getTime();
			const datePaid2 = data2[names.datePaid].toDate().getTime();
			let result = 0;
			if (datePaid1 < datePaid2)      { result = -1; }
			else if (datePaid1 > datePaid2) { result = 1; }
			else {
				const payee1 = data1[names.payee].toLowerCase();
				const payee2 = data2[names.payee].toLowerCase();
				if (payee1 < payee2)      { result = -1; }
				else if (payee1 > payee2) { result = 1; }
			}
			return result;
		};

		compareFuncs[names.payee] = (tr1, tr2) => {
			const data1 = getExpenseData(tr1);
			const data2 = getExpenseData(tr2);
			const payee1 = data1[names.payee].toLowerCase();
			const payee2 = data2[names.payee].toLowerCase();
			let result = 0;
			if (payee1 < payee2)      { result = -1; }
			else if (payee1 > payee2) { result = 1; }
			else {
				result = compareFuncs[names.datePaid](tr1, tr2);
			}
			return result;
		};

		compareFuncs[names.amount] = (tr1, tr2) => {
			const data1 = getExpenseData(tr1);
			const data2 = getExpenseData(tr2);
			const amount1 = data1[names.amount];
			const amount2 = data2[names.amount];
			let result = 0;
			if (amount1 < amount2)      { result = -1; }
			else if (amount1 > amount2) { result = 1; }
			else {
				result = compareFuncs[names.datePaid](tr1, tr2);
			}
			return result;
		};

		compareFuncs[names.purpose] = (tr1, tr2) => {
			const data1 = getExpenseData(tr1);
			const data2 = getExpenseData(tr2);
			const purpose1 = data1[names.purpose].toLowerCase();
			const purpose2 = data2[names.purpose].toLowerCase();
			let result = 0;
			if (purpose1 < purpose2)      { result = -1; }
			else if (purpose1 > purpose2) { result = 1; }
			else {
				result = compareFuncs[names.datePaid](tr1, tr2);
			}
			return result;
		};

		this.compareFunc = compareFuncs[names.datePaid];

		// Add a click event listener to each
		// column heading in the expenses table.
		const tr = document.querySelector('#expenses > thead > tr');
		for (const colName in compareFuncs) {
			//const func = compareFuncs[colName];
			const th = tr.querySelector(`th[data-name="${colName}"]`);
			th.addEventListener('click', (event) => table.sortRows(event));
		}

		app.getCollection(app.expensesPath(), cache, [this]);
	},

	/** Adds one row to the expenses table body. This function is
	 * called once for each existing document in the Firestore expenses
	 * collection and when a document is added to that collection. */
	addOne : function(expenseId, expenseData) {
		console.assert(check.string(expenseId));
		console.assert(check.object(expenseData));

		const names = app.dbNames;
		const cellId = createElement('td', null,
				{'data-name':names.expenseId}, expenseId);

		const datePaid = yyyymonddFromTimestamp(expenseData[names.datePaid]);
		const cellDatePaid = createElement('td', null,
				{'data-name':names.datePaid}, datePaid);

		const payee = expenseData[names.payee];
		const cellPayee = createElement('td', null,
				{'data-name':names.payee}, payee);

		const amount = expenseData[names.amount] / 100;
		const cellAmount = createElement('td', 'number',
				{'data-name':names.amount}, amount.toFixed(2));

		const purpose = expenseData[names.purpose];
		const cellPurpose = createElement('td', null,
				{'data-name':names.purpose}, purpose);

		const row = createElement('tr');
		row.appendChild(cellId);
		row.appendChild(cellDatePaid);
		row.appendChild(cellPayee);
		row.appendChild(cellAmount);
		row.appendChild(cellPurpose);

		const tbody = this.getTableBody();
		this.insertRow(tbody, row, this.compareFunc);
	},


	/** Modifies one row in the expenses HTML table body.
	 * This function is called when a document in the
	 * Firestore expenses collection is updated. */
	modifyOne : function(expenseId, expenseData) {
		console.assert(check.string(expenseId));
		console.assert(check.object(expenseData));
		const row = this.getRow(expenseId);
		if (row) {
			const names = app.dbNames;

			let name = names.datePaid;
			let cell = row.querySelector(`td[data-name="${name}"]`);
			cell.innerText = yyyymonddFromTimestamp(expenseData[name]);

			name = names.payee;
			cell = row.querySelector(`td[data-name="${name}"]`);
			cell.innerText = expenseData[name];

			name = names.amount;
			cell = row.querySelector(`td[data-name="${name}"]`);
			const amount = expenseData[name] / 100;
			cell.innerText = amount.toFixed(2);

			name = names.purpose;
			cell = row.querySelector(`td[data-name="${name}"]`);
			cell.innerText = expenseData[name];
		}
	},


	/** Called when a document was removed from a Firestore collection. */
	removeOne : function(expenseId) {
		console.assert(check.string(expenseId));
		const row = this.getRow(expenseId);
		if (row) {
			const tbody = this.getTableBody();
			tbody.removeChild(row);
		}
	},


	/** Inserts a row in sorted order into tbody. */
	insertRow : function(tbody, toInsert, compareFunc) {
		console.assert(check.HTMLElement(tbody));
		console.assert(check.HTMLElement(toInsert));
		console.assert(check.func(compareFunc));
		const rows = Array.from(tbody.children);
		const existing = rows.find((row) => compareFunc(toInsert, row) <= 0);
		tbody.insertBefore(toInsert, existing);
	},


	/** Sorts the rows in an HTML table when the
	 * user clicks on one of the column headers. */
	sortRows : function(event) {
		const columnHeading = event.target;
		const name = columnHeading.getAttribute('data-name');
		const compareFunc = this.compareFuncs[name];

		// Set the compareFunc attribute so that rows added with addOne()
		// will be inserted into the HTML table in its correct location.
		this.compareFunc = compareFunc;

		// Sort the rows in the HTML table body.
		const tbody = this.getTableBody();
		//const ar = Array.from(tbody.children);
		//ar.sort(compareFunc);
		//ar.forEach((row) => tbody.appendChild(row));
		Array.from(tbody.children)
			.sort(compareFunc)
			.forEach((row) => tbody.appendChild(row));
	},


	/** Returns a row from the expenses table. */
	getRow : function(docId) {
		const tbody = this.getTableBody();
		const colName = app.dbNames.expenseId;
		const column = tbody.querySelectorAll(`td[data-name="${colName}"]`);
		const td = Array.from(column)
				.find((elem) => elem.innerText == docId);
		const tr = td.closest('tr');
		console.assert(check.HTMLElement(tr));
		return tr;
	},


	getTableBody : function() {
		return document.querySelector('table#expenses > tbody');
	}
};


// Add an event listener to the HTML document that will call
// app.authenticate() when the HTML document is loaded.
document.addEventListener('DOMContentLoaded', (event) => app.authenticate(event));
