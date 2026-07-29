export const SAMPLE_QUIZ_SDN302_FA2024_FE = `Which HTTP method is typically used to create a new resource in a RESTful API?
A. GET
B. POST
C. PUT
D. DELETE
B

Which statements correctly describe RESTful API design principles? (Choose 3 answers)
A. Statelessness: Each request from a client to a server must contain all the information needed to understand and process the request.
B. Cacheability: Responses must define themselves as cacheable or not.
C. Uniform Interface: The interface between client and server must be uniform and consistent.
D. Stateful interactions: The server must keep track of client state across requests.
ABC

Which of the following are valid methods to read a file in Node.js? (Choose 2 answers)
A. fs.readFile()
B. fs.readSync()
C. fs.readFileSync()
D. fs.read()
AC

What is an API Gateway?
A. A tool that manages and routes API requests.
B. A database management system.
C. A web server that hosts static files.
D. A software development framework.
A

Which asynchronous method of the fs module is used to check whether a file exists?
A. fs.existsFile(filePath, function(exists) { ... })
B. fs.exists(filePath, function(exists) { ... })
C. fs.fileExists(filePath, function(exists) { ... })
D. fs.access(filePath, fs.constants.F_OK, (err) => { ... })
D

Which decorator is used in NestJS to mark a class as a controller?
A. @Service
B. @Injectable
C. @Controller
D. @Component
C

Which of the following statements about API Gateways are true? (Choose 2 answers)
A. An API Gateway can handle authentication and authorization.
B. An API Gateway is primarily used to store data.
C. An API Gateway can apply rate limiting to API requests.
D. An API Gateway cannot perform request validation.
AC

Consider the following code snippet for connecting to a MongoDB server. Identify the parts responsible for importing the MongoClient class and connecting to the server. (Choose 2 answers)
const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const dbName = 'mydatabase';
const client = new MongoClient(url);
async function run() {
  try {
    await client.connect();
    const db = client.db(dbName);
  } finally {
    await client.close();
  }
}
A. const { MongoClient } = require('mongodb') is responsible for importing the MongoClient class.
B. const url = 'mongodb://localhost:27017' is responsible for setting the database name.
C. await client.connect() is responsible for connecting to the MongoDB server.
D. const db = client.db(dbName) is responsible for closing the connection to the MongoDB server.
AC

You need to connect to a MongoDB server, create a new database named "library", create a collection named "books" within the "library" database, and list all databases on the server. Which order is correct?
A. First create a database reference using client.db('library'); then create a collection using await db.createCollection('books'); then list all databases using await adminDb.listDatabases().
B. First create a collection using await db.createCollection('books'); then create a database reference using client.db('library'); then list all databases.
C. First list all databases; then create the collection; then create the database reference.
D. First list all databases; then create the database reference; then create the collection.
A

Consider the following code snippet for serializing an object in JavaScript using JSON. Identify the parts responsible for serialization and deserialization. (Choose 2 answers)
const obj = { name: 'Alice', age: 25 };
const serializedObj = JSON.stringify(obj);
const deserializedObj = JSON.parse(serializedObj);
A. JSON.stringify(obj) is responsible for serialization.
B. JSON.parse(serializedObj) is responsible for deserialization.
C. console.log(serializedObj) is responsible for serialization.
D. console.log(deserializedObj) is responsible for deserialization.
AB

Which method is used to delete multiple documents in a MongoDB collection?
A. deleteMany()
B. removeDocuments()
C. deleteOne()
D. removeMany()
A

Which statements correctly describe CRUD operations in MongoDB? (Choose 2 answers)
A. updateOne() is used to update a single document in a collection.
B. deleteMany() is used to delete multiple documents from a collection.
C. findOne() is used to insert a single document into a collection.
D. insertMany() is used to update multiple documents in a collection.
AB

Which statements correctly describe the operations supported by the Node MongoDB Driver? (Choose 3 answers)
A. The driver supports connecting to a MongoDB server.
B. The driver supports inserting, deleting, updating, and querying documents.
C. The driver supports creating and managing relational databases.
D. The driver supports both callback-based and promise-based interactions.
ABD

Consider the following code snippet using Express.js. Identify the parts responsible for defining a route and starting the server. (Choose 2 answers)
const express = require('express');
const app = express();
app.get('/', (req, res) => {
  res.send('Hello, world!');
});
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
A. The require('express') statement defines the route.
B. The app.get('/', (req, res) => { ... }) statement defines the route.
C. The app.listen(3000, () => { ... }) statement starts the server.
D. The res.send('Hello, world!') statement starts the server.
BC

Which of the following statements correctly describe Express.js? (Choose 2 answers)
A. Express.js is free and open-source software under the MIT License.
B. Express.js is used only for creating mobile applications.
C. Express.js provides features for creating both web and mobile applications.
D. Express.js is a replacement for databases in Node.js applications.
AC

Analyze the following Express.js code snippet and determine what it does when accessed via a web browser. (Choose 3 answers)
const express = require('express');
const app = express();
app.use((req, res, next) => {
  console.log(req.method + ' request for ' + req.url);
  next();
});
app.get('/', (req, res) => {
  res.send('Welcome to the homepage!');
});
app.get('/about', (req, res) => {
  res.send('About us');
});
app.use((req, res) => {
  res.status(404).send('Page not found');
});
app.listen(3000);
A. It logs all incoming requests to the console.
B. It returns "Welcome to the homepage!" for GET requests to the root URL.
C. It returns a 404 error for any undefined routes.
D. It only handles POST requests.
ABC

Which of the following methods is used to populate referenced documents in Mongoose?
A. populate()
B. find()
C. lookup()
D. aggregate()
A

Which of the following are valid options for the populate() method in Mongoose? (Choose 2 answers)
A. select
B. path
C. model
D. field
AB

Which of the following is a wrong statement?
A. MongoDB is a database that runs the same everywhere.
B. MongoDB stores data in flexible, JSON-like documents.
C. MongoDB is a distributed database at its core, allowing you to intelligently place data where you want it.
D. MongoDB is a relational SQL database.
D

In MongoDB, the maximum size of a document is 16 megabytes (MB). How can you optimize the data model to avoid hitting the 16 MB limit? (Choose 3 answers)
A. Create separate documents for related data.
B. Normalize your data.
C. Use data types efficiently.
D. Store large binary data directly in documents.
ABC

What is a set of documents?
A. A collection
B. A database
C. A table
D. A document
A

Analyze the following code:
const express = require('express');
const app = express();
app.get('/', (req, res) => {
  res.send('Hello, this is a GET request');
});
app.listen(3000);
What is the correct URL to display the text "Hello, this is a GET request"?
A. http://localhost:3000/
B. http://localhost:3000/GET
C. http://localhost:3000/POST
D. http://localhost:3000/PUT
A

Which response headers are typically used to enable CORS in a RESTful API? (Choose 2 answers)
A. Access-Control-Allow-Methods
B. Access-Control-Allow-Origin
C. Content-Type
D. Cache-Control
AB

What are the benefits of using HTTPS in a Node.js application? (Choose 3 answers)
A. HTTPS encrypts data transmitted between the client and server, providing a secure channel for sensitive data.
B. HTTPS uses SSL/TLS certificates to authenticate the server and verify that the client is communicating with the correct server.
C. HTTPS can help build user trust by providing a secure environment for transmitting sensitive data.
D. HTTPS adds computational overhead because encryption and decryption require additional resources.
ABC

What are appropriate ways to secure a RESTful API? (Choose 2 answers)
A. Include API keys in URL parameters.
B. Use HTTPS for all communications.
C. Disable CORS.
D. Use JWT (JSON Web Tokens) for authentication.
BD

Each subsequent request from the client side should include the _____ in the request header.
A. token
B. passport
C. cookie
D. session
A

Which statements correctly describe the responsibilities of a Mongoose model? (Choose 2 answers)
A. Models are responsible for document interactions such as creating, reading, updating, and deleting.
B. Models are used only for creating documents.
C. Models are used only to define database indexes.
D. Models apply the schema to each document in their collection.
AD

Which statements correctly describe the structure of MongoDB documents and collections? (Choose 3 answers)
A. No fixed structure is imposed on a document by default.
B. Any document can be stored in a collection.
C. MongoDB enforces a strict schema on all documents.
D. It relies on the developer's discipline to maintain document structure.
ABD

What is middleware in Mongoose?
A. Functions that run before or after a database operation.
B. Functions that create schemas.
C. Functions that manage database connections.
D. Functions that define models.
A

What is two-factor authentication?
A. A security measure that requires only a username and password.
B. A security measure that requires a password and a security question.
C. A security measure that requires two forms of identification, typically a password and a unique code sent to a mobile device or email address.
D. A security measure that requires users to complete a CAPTCHA.
C

Cookies are parsed in an Express server using which middleware?
A. cookies
B. cookie-parser
C. cookie-body
D. cookie-value
B

What is authentication?
A. The process of verifying the identity of a user or system.
B. The process of encrypting data.
C. The process of storing data in a database.
D. The process of transforming data for analysis.
A

What is an SSL certificate?
A. A digital certificate that authenticates a website's identity and enables an encrypted connection.
B. A file that stores user credentials.
C. Software that manages database transactions.
D. A protocol for transferring files between servers.
A

Which of the following Mongoose schema configurations enables a default value?
A. default: 18
B. required: true
C. validate: {}
D. immutable: true
A

Which of the following Mongoose schema configurations enables validation of values?
A. default: 18
B. required: true
C. validate: {}
D. immutable: true
B

Which of the following statements about npm (Node Package Manager) are correct? (Choose 2 answers)
A. npm is a package manager for JavaScript.
B. npm can be used to install, share, and distribute code.
C. npm is only used for managing dependencies in Node.js.
D. npm cannot be used for managing scripts.
AB

Which of the following Mongoose schema types is used to define a reference subdocument?
A. [String]
B. { type: String }
C. { type: Schema.Types.ObjectId, ref: 'SubDoc' }
D. [Schema.Types.Mixed]
C

Which of the following are valid ways to define a Mongoose schema with timestamps? (Choose 2 answers)
A. new Schema({ fieldName: String }, { timestamps: true })
B. new Schema({ fieldName: { type: String, timestamps: true } })
C. new Schema({ fieldName: String }, { timestamps: false })
D. new Schema({ fieldName: String }).set('timestamps', true)
AD

What is one of the main benefits of using Mongoose population?
A. It simplifies data retrieval by allowing related data to be retrieved in a single query.
B. It increases the complexity of the code.
C. It removes the need for schemas.
D. It disables validation.
A

Which statements correctly describe the use of population in Mongoose queries? (Choose 2 answers)
A. Population is used to join data from multiple collections.
B. Population is used to update multiple documents.
C. Population can be performed using the populate() method in a query.
D. Population requires the use of schemas only.
AC

How can asynchronous operations be handled in a more readable and maintainable way? (Choose 2 answers)
A. Using Promises.
B. Using nested callbacks.
C. Using other control flow libraries.
D. Using Async/Await.
AD

What are the key features of Node.js? (Choose 2 answers)
A. Multithreaded.
B. Asynchronous and Event-Driven.
C. Synchronous and Blocking.
D. Single-Threaded but Highly Scalable.
BD

Which of the following are valid ways to handle errors in Node.js? (Choose 2 answers)
A. Ignoring errors because Node.js handles them automatically.
B. Using a try-catch block.
C. Using the process.on('exit') event.
D. Attaching an error event listener to EventEmitter instances.
BD

Which is the wrong statement about the difference between setImmediate() and setTimeout()?
A. setImmediate() schedules the callback to run immediately after the current event loop iteration.
B. setTimeout() schedules the callback after a specified delay, which can be zero or a positive number of milliseconds.
C. If both setTimeout() and setImmediate() are called in the same loop iteration, setTimeout() will always execute first.
D. None of the above.
C

Which statements about Promises in Node.js are true? (Choose 2 answers)
A. A Promise represents the eventual completion or failure of an asynchronous operation and its resulting value.
B. Promises are used to handle synchronous operations.
C. A Promise is in one of three states: pending, fulfilled, or rejected.
D. Promises can only handle one asynchronous operation at a time.
AC

In the OAuth 2.0 framework, what is the role of the Authorization Server?
A. To host the resource being requested.
B. To issue tokens to clients after successfully authenticating the resource owner.
C. To store user credentials.
D. To provide an interface for user registration.
B

What is Express Generator?
A. A tool for managing databases.
B. A command-line tool that helps quickly generate the basic structure and files for an Express.js application.
C. A library for creating front-end UI components.
D. A debugger for Node.js applications.
B

You need to include a common header and footer in multiple EJS templates. Which statements are correct? (Choose 2 answers)
A. <%- include('header') %> includes the header partial.
B. <%- include('footer') %> includes the footer partial.
C. <h2>Welcome to the Home Page</h2> includes a partial.
D. <title>Home</title> includes the footer partial.
AB

Which module is used for setting up your Express server to accept file uploads?
A. path
B. http
C. multer
D. body-parser
C

How are HTTP requests and responses handled in Node.js?
A. Using the built-in morgan module.
B. Using the built-in http module.
C. Using the built-in body-parser module.
D. Using the built-in cookie-parser module.
B`;
