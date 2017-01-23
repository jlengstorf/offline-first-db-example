(() => {

  // Open a connection to the local PouchDB database.
  const db = new PouchDB('thoughts');

  // Keep the local PouchDB database and the remote CouchDB database in sync.
  const remoteDb = 'https://aeb11b87-da4d-4ed6-b7a8-15fbe9bf2c2d-bluemix:82a9a8539185d4a1d0c77aae963ebfbb3f521716e36e0b514679bf99299043be@aeb11b87-da4d-4ed6-b7a8-15fbe9bf2c2d-bluemix.cloudant.com/thoughts';
  PouchDB.sync('thoughts', remoteDb, {
    live: true,
    retry: true,
  });

  // Whenever there are changes on the remote database, we want to reload.
  db.changes({
    since: 'now',
    live: true,
  }).on('change', reloadThoughts);

  // Do the initial load, which will grab all thoughts via PouchDB.
  loadAllThoughts();

  // Catch form submissions and do our Pouchy magic.
  const thoughtForm = document.querySelector('.thought-form');
  thoughtForm.addEventListener('submit', event => {
    event.preventDefault();
    handleFormSubmission();
  });

  // Add editing and deletion capabilities for thoughts using event delegation.
  const thoughtsList = document.querySelector('.app-content__thoughts');
  thoughtsList.addEventListener('click', event => {

    if (event.target.classList.contains('thought__action')) {
      event.preventDefault();

      // Get the thought’s ID.
      let thoughtId = false;
      do {
        const element = event.target.parentNode;
        if (element.classList.contains('thought')) {
          thoughtId = element.dataset.id;
        }
      } while (!thoughtId);

      if (event.target.classList.contains('thought__action--edit')) {
        console.log(`Editing thought#${thoughtId}`);
        loadOneThought(thoughtId).then(populateForm);
        return;
      }

      if (event.target.classList.contains('thought__action--delete')) {
        console.log(`Deleting thought#${thoughtId}`);
        deleteThought(thoughtId);
        return;
      }
    }
  });

  function handleFormSubmission() {

    // We need to get values from both form inputs.
    const inputs = getInputs();

    // Cancel the submission if we’re missing the required field.
    if (!inputs.thought.value) {
      console.error('The thought field is required; bailing.');
      return;
    }

    // If there’s an existing ID, use it. Otherwise generate a new one.
    const _id = inputs._id.value || new Date().toISOString();

    // Start building our database record. `_id` is the only required field.
    const record = {
      _id,
      thought: inputs.thought.value,
    };

    // Only save the notes value if it was set.
    // Records don’t need to have all the same fields. This is both very useful
    // and potentially VERY troublesome if used without forethought.
    if (inputs.notes.value) {
      record.notes = inputs.notes.value;
    }

    // Same with the _rev: only save it if one was passed.
    if (inputs._rev.value) {
      record._rev = inputs._rev.value;
    }

    // Add the record to the database.
    saveThought(record);
  }

  // Utility function so we can manipulate the form’s inputs.
  function getInputs() {
    return {
      thought: document.getElementById('thought'),
      notes: document.getElementById('notes'),
      _id: document.getElementById('_id'),
      _rev: document.getElementById('_rev'),
    };
  }

  // Empties the form.
  function clearFormInputs() {
    const inputs = getInputs();

    // Use an array of prop names so we can map a function to empty the form.
    // If you’re not familiar with functional programming, this is effectively a
    // forEach loop.
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
    Object.keys(inputs).map(key => inputs[key].value = '');
  }

  // Creates markup for thoughts and adds them to the DOM.
  function displayThoughts(thoughts) {

    // Get the element we’re using to display thoughts.
    const target = document.querySelector('.app-content__thoughts');

    // Grab the Handlebars template and get it ready for use.
    // See http://handlebarsjs.com/
    const template_source = document.getElementById('thought-template').innerHTML;
    const template = Handlebars.compile(template_source);

    // Generate markup using the template and thoughts data.
    // Note that we’re adding the `thoughts` array to an object as the
    // `thoughts` property. This is important, because Handlebars needs an
    // object to work properly.
    const markup = template({ thoughts });

    // Add the generated markup to the target element, replace existing content.
    target.innerHTML = markup;
  }

  function populateForm(record) {
    const inputs = getInputs();
    const values = ['thought', 'notes', '_id', '_rev'];

    // Set all the form inputs to show the value.
    Object.keys(inputs).map(key => inputs[key].value = record[key] || '');
  }

  function loadAllThoughts() {

    // Load all records from PouchDB.
    // See https://pouchdb.com/api.html#batch_fetch
    db.allDocs({
      include_docs: true,
      descending: true,
    }).then(result => {
      displayThoughts(result.rows.map(row => row.doc));
    });
  }

  // This is just here to add logging on reload. We could reuse loadAllThoughts().
  function reloadThoughts() {
    console.log('Reloading!');
    loadAllThoughts();
  }

  // Loads a single thought by its ID.
  function loadOneThought(id) {
    return db.get(id)
      .catch(error => {
        console.log(error);
      });
  }

  // Creates or updates a thought record.
  function saveThought(record) {

    // Save the record using PouchDB.
    // See https://pouchdb.com/api.html#create_document
    db.put(record).then(response => {
      console.log('Thought saved! ', response);

      // Once we’ve saved the thought, clear the form for convenience.
      clearFormInputs();

      // Reload the thoughts from PouchDB so the new thought is displayed.
      // This could be manually added to the DOM if you wanted to add effects.
      reloadThoughts();
    }).catch(error => {

      // If there’s an issue, log it to the console. In a real app, this is
      // where we’d display a helpful error message on the form.
      console.error(error);
    });
  }

  // Deletes a single thought by its ID.
  function deleteThought(id) {
    return loadOneThought(id).then(record => {

      // See https://pouchdb.com/api.html#delete_document
      return db.remove(record);
    }).catch(error => {
      console.error(error);
    });
  }
})();
