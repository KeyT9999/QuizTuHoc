export const SAMPLE_QUIZ_SDN302_SU25_B5_1 = `Which of the following is a standard security protocol used for secure communication over the internet?
A. FTP
B. SMTP
C. SSL/TLS
D. HTTP
C

What is the difference between PUT and PATCH methods in REST APIs?
A. PUT updates partial resources, PATCH updates full resources.
B. PUT updates full resources, PATCH updates partial resources.
C. PUT deletes resources, PATCH creates resources.
D. PUT and PATCH are identical.
B

What will the following API endpoint return when called with an invalid user ID?
app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  if (!isValidId(userId)) {
    res.status(400).send('Invalid ID');
  } else {
    res.status(200).send('User details');
  }
});
A. 400 and "Invalid ID"
B. 500 and "Internal Server Error"
C. 404 and "Not Found"
D. 200 and "User details"
A

Which of the following HTTP methods is idempotent?
A. POST
B. PUT
C. DELETE
D. Both B and C
D

Which header is used to send JSON data in an API request?
A. Accept-Encoding
B. Content-Type
C. Authorization
D. Connection
B

Analyze the following connection string formats and determine which are used for standard and SRV connection formats in MongoDB:
mongodb://localhost:27017/mydatabase
mongodb+srv://cluster0.mongodb.net/mydatabase
A. mongodb://localhost:27017/mydatabase is a standard connection string format; mongodb+srv://cluster0.mongodb.net/mydatabase is an SRV connection format.
B. mongodb://localhost:27017/mydatabase is an SRV connection format; mongodb+srv://cluster0.mongodb.net/mydatabase is a standard connection string format.
C. Both connection strings are SRV formats.
D. Both connection strings are standard formats.
A

Which steps are required to establish a connection to a MongoDB server using the MongoClient class? (Choose 2 answers)
A. Import the MongoClient class from the mongodb module with the require() statement.
B. Create an instance of the MongoDatabase class.
C. Call the connect() method on the MongoClient instance by passing the MongoDB server URL.
D. Use the import statement to import MongoClient.
AC

What is Serialization?
A. The process of converting a data object into a series of bytes for saving or transmitting.
B. The process of converting text into an image.
C. The process of encrypting data.
D. The process of compressing data.
A

Which of the following statements correctly describe the MongoClient class and connection strings in MongoDB? (Choose 2 answers)
A. The MongoClient class represents a database connection.
B. The MongoClient class represents a collection.
C. A connection string must be passed to the MongoClient constructor.
D. A connection string is not required to connect to MongoDB.
AC

What is the purpose of using regex in MongoDB queries?
A. To sort the documents.
B. To filter documents based on pattern matching.
C. To update multiple documents.
D. To delete a specific document.
B

Which function is used to import the MongoDB driver in a Node.js application?
A. import mongodb from 'mongodb';
B. require('mongodb');
C. include('mongodb');
D. use('mongodb');
B

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

What is the purpose of the populate() method in Mongoose?
A. To fetch referenced documents.
B. To delete documents.
C. To update a schema.
D. To create new collections.
A

What is Express.js?
A. A database management system.
B. A front-end framework for designing UI.
C. A back-end web application framework for Node.js.
D. A text editor for coding.
C

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

Which statements about REST and Express.js routing are true? (Choose 2 answers)
A. REST stands for Representational State Transfer.
B. REST requires using the SOAP protocol.
C. Express.js supports RESTful routing through methods like app.get, app.post, app.put, and app.delete.
D. RESTful routes do not include HTTP verbs.
AC

Which aggregation pipeline stage is used to group documents?
db.orders.aggregate([
  { $group: { _id: '$status', total: { $sum: '$amount' } } }
]);
A. $match
B. $project
C. $group
D. $sort
C

To avoid multi-level embedded documents, which method should be used when storing an array of comments?
A. Embed an array of comments within a "dishes" document.
B. Store the comments in a separate "comments" collection and use the post ID to link them together.
C. Store the comments in separate "comments" and "dishes" collections without linking them.
D. None of the above.
B

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

What is a set of documents?
A. A collection
B. A database
C. A table
D. A document
A

Which middleware handles JSON data in Express.js?
A. body-parser
B. json-middleware
C. express-json
D. express-parser
A

What is OAuth primarily used for?
A. Encrypting data.
B. Authenticating and authorizing users.
C. Storing user data.
D. Validating SQL queries.
B

Which is NOT a best practice for mitigating risks when using Cross-Origin Resource Sharing (CORS)?
A. Unrestricting cross-origin access.
B. Using appropriate HTTP methods.
C. Validating user input.
D. Using CSRF protection mechanisms.
A

Which of the following is a wrong statement?
A. Cross-Origin Resource Sharing (CORS) is a browser mechanism which enables controlled access to resources located outside of a given domain.
B. The CORS mechanism supports secure cross-origin requests and data transfers between browsers and servers.
C. For security reasons, browsers do not restrict cross-origin HTTP requests initiated from scripts.
D. CORS allows web applications to make requests to a domain different from the one that served the web application.
C

What is the main purpose of HTTPS?
A. Speed up web requests.
B. Secure communication over a network.
C. Manage HTTP methods.
D. Provide dynamic routing.
B

Which CLI command is used to generate a new service in NestJS?
A. nest new service
B. nest generate service
C. nest create service
D. nest add service
B

What is Mongoose in Node.js?
A. A web framework.
B. A library for handling SQL databases.
C. An ODM for MongoDB.
D. A tool for managing server logs.
C

What is population in Mongoose?
A. The process of updating documents in a collection.
B. The process of embedding documents within other documents.
C. The process of automatically replacing the specified paths in a document with documents from other collections.
D. The process of validating documents before saving.
C

What is the purpose of the Authentication middleware?
A. To validate that the anti-forgery token is present and valid in a form submission.
B. To encrypt sensitive data in web forms.
C. To handle user authentication and establish an identity for the user.
D. To prevent Cross-Site Request Forgery (CSRF) attacks.
C

Cookies are parsed in an Express server using which middleware?
A. cookies
B. cookie-parser
C. cookie-body
D. cookie-value
B

What does JWT stand for?
A. JavaScript Web Tool
B. JSON Web Token
C. Java Web Tracker
D. JSON Wide Transfer
B

Which method is used to define a schema in Mongoose?
A. mongoose.Schema()
B. mongoose.Model()
C. mongoose.createSchema()
D. mongoose.defineSchema()
A

Which HTTP status code indicates "Unauthorized"?
A. 200
B. 401
C. 403
D. 404
B

What is a good practice to secure user passwords in a database?
A. Store as plain text.
B. Hash and salt before storing.
C. Use Base64 encoding.
D. Encrypt using SSL.
B

What object is used to send data back to the client in Express?
A. req
B. res
C. app
D. next
B

What is the main benefit of using RESTful APIs?
A. Ease of debugging.
B. Consistency and scalability.
C. Faster server response.
D. Reduced memory usage.
B

Which of the following is a correct way to define a reference in a Mongoose schema?
A. { type: mongoose.Schema.Types.Mixed, ref: 'User' }
B. { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
C. { type: mongoose.Schema.Types.ObjectId, 'User' }
D. { type: mongoose.Schema.Types.ObjectId, reference: 'User' }
B

Which of the following is NOT a use case for Mongoose in Node.js?
A. Mongoose provides query and aggregation methods that allow you to retrieve data from the database flexibly and efficiently.
B. Mongoose provides built-in validation to ensure data meets certain criteria before it is stored.
C. Mongoose allows you to define schemas for MongoDB collections.
D. Using Mongoose for deeply nested arrays and highly complex data structures that are difficult to model.
D

Which of the following statements correctly describe the process of creating and starting an HTTP server in Node.js? (Choose 2 answers)
A. The http.createServer() method is used to create a server instance.
B. The server.listen() method is used to start the server and listen for incoming requests.
C. The require('http') statement is used to install the http module.
D. The npm i http command is used to require the http module in your code.
AB

What is Mongoose in Node.js?
A. A database.
B. A MongoDB object modeling tool.
C. An HTTP client.
D. A web server framework.
B

What is CSRF in web security?
A. A type of data encryption.
B. Cross-Site Request Forgery.
C. A way to secure tokens.
D. Cross-Service Response Failure.
B

Which method is used for population in Mongoose?
A. populate()
B. reference()
C. associate()
D. link()
A

Which of the following is a valid use of populate()?
A. Model.find().populate('field')
B. Model.insert().populate('field')
C. Model.delete().populate('field')
D. Model.update().populate('field')
A

What is Node.js?
A. A database system.
B. A runtime for JavaScript on the server side.
C. A front-end library.
D. A JavaScript framework.
B

How can asynchronous operations be handled in a more readable and maintainable way? (Choose 2 answers)
A. Using Promises.
B. Using nested callbacks.
C. Using other control flow libraries.
D. Using Async/Await.
AD

Which is the wrong statement about the difference between setImmediate() and setTimeout()?
A. setImmediate() schedules the callback function to run immediately after the current event loop iteration.
B. setTimeout() schedules the callback function to run after a specified delay, which can be zero or a positive integer representing milliseconds.
C. If both setTimeout() and setImmediate() are called in the same loop iteration, setTimeout() will always be executed before setImmediate().
D. None of the above.
C

Which of the following statements about callback functions in Node.js are true? (Choose 2 answers)
A. Callbacks can only be used with setTimeout and setInterval.
B. Callbacks are functions passed as arguments to other functions.
C. Callbacks are executed immediately after being defined.
D. Callbacks are used to handle asynchronous operations.
BD

In the OAuth 2.0 framework, what is the role of the Authorization Server?
A. To host the resource being requested.
B. To issue tokens to clients after successfully authenticating the resource owner.
C. To store user credentials.
D. To provide an interface for user registration.
B

Which protocol is used for secure communication over the web?
A. SSL
B. TLS
C. Both SSL and TLS
D. HTTP
C

Which module is used for setting up your Express server to accept file uploads?
A. path
B. http
C. multer
D. body-parser
C`;
