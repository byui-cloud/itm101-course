'use strict';

/** A global object that contains all code
 * for the min-max inventory system. */
window.mminv = {
	/** Shows the first tab and corresponding fragment
	 * by programmatically clicking a tab. */
	showFirstFrag : function(event) {
		const self = window.mminv;
		self.suppliers.init();
		self.products.init();
		self.receiving.init();
		self.outgoing.init();
		const tab = document.querySelector('header > ul.tabs > li.selected');
		tab.click();
	},


	/** Selects one tab and shows the corresponding fragment. Also,
	 * unselects all other tabs and hides the other fragments. */
	showFrag : function(event, id) {
		// Clear all the fragments.
		const self = window.mminv;
		self.suppliers.empty();
		self.products.empty();
		self.receiving.empty();
		self.outgoing.empty();

		// Prepare the user selected fragment
		// before showing it to the user.
		switch (id) {
			case 'products':  self.products.prepare();  break;
			case 'suppliers': self.suppliers.prepare(); break;
			case 'receiving': self.receiving.prepare(); break;
			case 'outgoing':  self.outgoing.prepare();  break;
			default:
				break;
		}

		// Remove the highlight from all tabs except
		// for the tab selected by the user.
		const selected = 'selected';
		const tabs = document.querySelector('ul.tabs').children;
		Array.from(tabs).forEach((tab) => tab.classList.remove(selected));
		event.currentTarget.classList.add(selected);

		// Hide all of the fragments except
		// for the one selected by the user.
		const frags = document.querySelectorAll('#main > div.frag');
		Array.from(frags).forEach((frag) => frag.classList.remove(selected));
		document.querySelector(`#${id}`).classList.add(selected);
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


	/** Gets and returns one HTML element by its ID. */
	getById : function(id) {
		return document.getElementById(id);
	},


	firestore : null,
	getDatabase : function() {
		let db = this.firestore;
		if (! db) {
			const app = firebase.initializeApp(firebaseConfig);
			db = firebase.firestore(app);
			this.firestore = db;
		}
		return db;
			let cellId = create('td', null, {name:'product_id'}, prodId);

	},


	dbNames : {
		suppliers: "suppliers",
		suplrId:   "supplier_id",
		suplrName: "supplier_name",
		email:     "email_address",
		phone:     "phone_number",

		products: "products",
		prodId:   "product_id",
		prodName: "product_name",
		minQuant: "min_quantity",
		quant:    "quantity",
		maxQuant: "max_quantity"
	},


	getCollection : function(path, successFunc) {
		const db = this.getDatabase();
		db.collection(path)
			.get()
			.then((snapshot) => {
				// Convert the Firestore snapshot to a standard
				// JavaScript object. I have unsuccessfully tried to
				// find a simpler or more efficient way to do this.
				let object = { };
				snapshot.forEach((doc) => object[doc.id] = doc.data());

				// Call the success callback function so that the
				// calling object gets access to the Firestore data.
				successFunc(object);
			})
			.catch((error) => {
				console.log(`Error getting collection ${path}: `,
						JSON.stringify(error));
			});
	},


	/*
	queryDatabase : function(path, field, comparison, value, successFunc) {
		const db = this.getDatabase();
		db.collection(path).where(field, comparison, value)
			.get()
			.then(successFunc)
			.catch((error) => {
				console.log(`Error querying collection ${path}: `,
						JSON.stringify(error));
			});
	},
	*/


	updateDocument : function(path, docId, object) {
		const db = this.getDatabase();
		db.collection(path).doc(docId)
			.update(object)
			.catch((error) => {
				console.log(`Error ${path}/${docId} not updated: `,
						JSON.stringify(error));
			});
	},


	deleteDocument : function(path, docId) {
		const db = this.getDatabase();
		db.collection(path).doc(docId)
			.delete()
			.catch((error) => {
				console.log(`Error document ${path}/${docId} not deleted: `,
						JSON.stringify(error));
			});
	}
};
