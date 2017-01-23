# Offline-First/Progressive Web App w/PouchDB

[Try the demo.](https://code.lengstorf.com/offline-first-db-example/)

This app shows how to set up an offline-first web app using PouchDB.

Databases are weird. One the one hand, they seem simple: we just... put stuff in there, right? But on the other hand, they seem ridiculously complicated: _where do I put it? how do I get it back out? what if I only need some of the data?_

Plus there are servers (or something). Connections. Someone said something about injection attacks, and that sounds terrifying.

In this talk, we'll look at basic NoSQL databases for reading and writing data, as well as how to handle basic security. And then, just for fun, we'll make it all work in real time.

## How to Run This Demo Locally

``` sh
# Clone the repo
git clone git@github.com:jlengstorf/offline-first-db-example.git

# Move into the repo
cd offline-first-db-example/

# Install dependencies
npm install

# Build the site
npm run build

# Start the app
npm run serve

# Open the app in your default browser
open http://localhost:8080/
```
