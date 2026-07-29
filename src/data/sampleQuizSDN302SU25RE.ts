export const SAMPLE_QUIZ_SDN302_SU25_RE = `Which HTTP method is typically used to create a new resource in a RESTful API?
A. GET
B. POST
C. PUT
D. DELETE
B

In HTTP, _____ method is used to retrieve information from the given server using a given URL. Requests using _____ should only retrieve data.
A. None
B. GET, GET
C. POST, POST
D. GET, POST
B

How to handle HTTP requests and responses in Node.js?
A. Using the built-in morgan module
B. Using the built-in http module
C. Using the built-in body-parser module
D. Using the built-in cookie-parser module
B

Which HTTP code means that the data does not pass validation, or is in the wrong format?
A. 100
B. 101
C. 404
D. 400
D

What is an API Gateway?
A. A tool that manages and routes API requests.
B. A database management system.
C. A web server that hosts static files.
D. A software development framework.
A

Which of the following statements correctly describe Serialization? (Choose 2 answers)
A. Serialization converts an object into a stream of bytes.
B. Serialization is used to convert data into JSON format.
C. Serialization saves the state of the object in an easily transmittable form.
D. Serialization compresses data to save storage space.
AC

Which statements correctly describe how to create a new database and collection in MongoDB? (Choose 2 answers)
A. A new database is created automatically when you insert data into a collection in that database.
B. You must manually create a database before creating a collection.
C. A new collection is created using the createCollection() method.
D. A new collection is created using the addCollection() method.
AC

Analyze the following scenario and determine which MongoDB CRUD operations would be most beneficial. Scenario: A task management application needs to handle operations where tasks can be created, retrieved, updated, and deleted by users. Users should be able to update the status of a task and delete tasks that are no longer needed. (Choose 3 answers)
A. Use insertOne to create new tasks.
B. Use find to retrieve tasks.
C. Use updateMany to delete tasks.
D. Use deleteOne to delete tasks.
ABD

To connect to a MongoDB database and perform CRUD operations using the Node MongoDB Driver, identify the parts responsible for connecting, inserting, and querying documents. (Choose 3 answers)
A. client.connect() is responsible for connecting to the MongoDB server.
B. col.insertOne({ name: "Nguyen Van A", age: 20 }) is responsible for inserting a document.
C. col.find({}).toArray() is responsible for querying documents.
D. client.close() is responsible for deleting a document.
ABC

What is MongoDB?
A. A document database.
B. A relational database.
C. A key-value store.
D. A columnar database.
A

Which statements correctly describe the characteristics of NoSQL databases? (Choose 2 answers)
A. NoSQL databases are horizontally scalable.
B. NoSQL databases are primarily used for structured data.
C. NoSQL databases do not use relational data modeling techniques.
D. NoSQL databases cannot handle large volumes of data.
AC

Which of the following are valid options for the populate() method in Mongoose? (Choose 2 answers)
A. select
B. path
C. model
D. field
AB

Which of the following are valid ways to populate referenced documents in Mongoose? (Choose 2 answers)
A. Post.find().populate('author').lean();
B. Post.find().populate('author').exec();
C. Post.find().populate({ path: 'author' }).exec();
D. Post.find().populate({ ref: 'User' }).exec();
BC

Which of the following methods are used to populate referenced documents in Mongoose?
A. populate()
B. find()
C. lookup()
D. aggregate()
A

What is the purpose of the CSR (Certificate Signing Request) in the SSL certificate creation process?
A. To encrypt the data on the server.
B. To request a digital certificate from a Certificate Authority (CA).
C. To create a private key.
D. To verify the domain ownership.
B

_____ is a fast, unopinionated and minimalist web framework for Node.js.
A. Express
B. Spring
C. Hibernate
D. .NET
A

What is the MongoDB equivalent of a "table"?
A. Document
B. Field
C. Collection
D. Schema
C

Which of the following is NOT a limitation of indexes in MongoDB?
A. Indexes can take up a significant amount of disk space, especially for large collections or indexes with many fields.
B. Indexes can slow down write operations, as MongoDB needs to update the index whenever a document is inserted, updated, or deleted.
C. Indexes can become fragmented over time, which can reduce their effectiveness.
D. Indexes can speed up queries on large collections by reducing the number of documents that need to be examined.
D

How to install Express?
A. node install express --save
B. npm uninstall express --save
C. npm install express --save
D. npm express install
C

Which HTTP header is used to pass the OAuth token in requests?
A. Authorization
B. Authentication
C. Bearer
D. Access-Token
A

What is the purpose of CORS?
A. To manage secure communication over HTTPS.
B. To enable requests from one origin to another.
C. To improve database performance.
D. To encrypt data between clients and servers.
B

Which of the following methods triggers a preflight request in CORS?
A. GET
B. POST with Content-Type: application/json
C. DELETE
D. OPTIONS
B

What are appropriate ways to secure a RESTful API? (Choose 2 answers)
A. Including API keys in URL parameters.
B. Using HTTPS for all communications.
C. Disabling CORS.
D. Using JWT (JSON Web Tokens) for authentication.
BD

What is the purpose of Dependency Injection in NestJS?
A. To make HTTP requests faster.
B. To reduce memory usage.
C. To manage and share resources efficiently between modules.
D. To handle errors in controllers.
C

Which decorator is used to inject a dependency into a service in NestJS?
A. @Injectable
B. @Inject
C. @Service
D. @Provider
B

What is the purpose of a salt in password hashing?
A. To add flavor to the hashed password.
B. To store the password in plain text in the database.
C. To add random data to the password before hashing, making it more difficult for attackers to use precomputed lookup tables to crack the hashed password.
D. To add a secret key to the password before hashing, making it more difficult for attackers to crack the hashed password.
C

What does the save() method do in Mongoose?
A. Deletes a document.
B. Validates and inserts a document into the database.
C. Updates a document in the database.
D. Finds a document in the database.
B

How do you create a model in Mongoose?
A. mongoose.define()
B. mongoose.Model()
C. mongoose.create()
D. mongoose.model()
D

Which of the following is not a valid Mongoose data type?
A. String
B. Number
C. Boolean
D. Char
D

Each subsequent request from the client side should include the _____ in the request header.
A. token
B. passport
C. cookie
D. session
A

What is the primary purpose of JWT (JSON Web Token)?
A. Encrypt user data.
B. Authenticate and authorize users.
C. Perform database operations.
D. Send push notifications.
B

Which protocol is commonly used for authentication in web applications?
A. HTTP
B. OAuth
C. FTP
D. SMTP
B

Which HTTP method is used to retrieve data from a REST API?
A. POST
B. GET
C. DELETE
D. PUT
B

Which tool is commonly used to test RESTful APIs?
A. Node.js
B. Postman
C. MongoDB Compass
D. Express.js
B

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

Analyze the following code:
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: String,
  email: String,
  age: Number,
  createAt: String
});
const User = mongoose.model('User', userSchema);
Which document is valid to save in MongoDB with the Mongoose schema above?
A. User [{ name: 'Abbert', email: 'abbert@gmail.com.vn', age: 24, createAt: '20/4/2020' }, { name: 'Mary', email: mary@gmail.com.vn, age: 24, createAt: '20/4/2020' }]
B. User [{ name: 'Abbert', email: 'abbert@gmail.com.vn', age: 24, createAt: '20/4/2020' }, { name: 'Abbert', email: mary@gmail.com.vn, age: '24', createAt: '20/4/2020' }]
C. User [{ name: 'Abbert', email: 'abbert@gmail.com.vn', age: '24', createAt: '20/4/2020' }, { name: 'Mary', email: 'abbert@gmail.com.vn', age: 24, createAt: '20/4/2020' }]
D. User [{ name: 'Abbert', email: 'abbert@gmail.com.vn', age: '24', createAt: '20/4/2020' }, { name: 'Mary', email: 'mary@gmail.com.vn', age: 24, createAt: '20/4/2020' }]
D

Which of the following methods are used to find and update a document in Mongoose? (Choose 2 answers)
A. updateOne()
B. update()
C. findOneAndUpdate()
D. findByIdAndUpdate()
CD

Which statements correctly describe the benefits of Mongoose population? (Choose 2 answers)
A. Population makes the code cleaner and more intuitive when dealing with related data.
B. Population makes it harder to read and understand the code.
C. Population reduces the need for multiple round trips to the database.
D. Population can only be used with single-level documents.
AC

Which function is essential in configuring Passport to serialize user information into the session?
A. passport.authenticate()
B. passport.serializeUser()
C. passport.session()
D. passport.login()
B

What type of relationship does Mongoose population create?
A. One-to-one or one-to-many.
B. Many-to-many only.
C. No relationship.
D. SQL-style joins.
A

What is one of the main benefits of using Mongoose population?
A. It simplifies data retrieval by allowing related data to be retrieved in a single query.
B. It increases the complexity of the code.
C. It removes the need for schemas.
D. It disables validation.
A

What are the key features of Node.js? (Choose 2 answers)
A. Multithreaded.
B. Asynchronous and Event-Driven.
C. Synchronous and Blocking.
D. Single-Threaded but Highly Scalable.
BD

Consider the following code snippet using async/await:
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}
fetchData();
What are the advantages of using async/await in this code? (Choose 2 answers)
A. It makes the code easier to read and understand.
B. It ensures the code runs synchronously.
C. It simplifies error handling with try/catch blocks.
D. It eliminates the need for callbacks entirely.
AC

How can you optimize code to work efficiently with the event loop in Node.js? (Choose 2 answers)
A. Avoiding blocking the event loop.
B. Using setTimeout() instead of setImmediate().
C. Avoiding nested callbacks.
D. Writing non-blocking code.
AD

Which of the following are valid ways to handle errors in Node.js? (Choose 2 answers)
A. Ignoring errors as Node.js handles them automatically.
B. Using a try-catch block.
C. Using the process.on('exit') event.
D. Attaching an error event listener to EventEmitter instances.
BD

What is the default port for HTTPS?
A. 80
B. 443
C. 8080
D. 8443
B

What is the primary purpose of Single Sign-On (SSO)?
A. To allow users to access multiple applications with a single login.
B. To improve password security by requiring complex passwords.
C. To provide multifactor authentication.
D. To encrypt user data during transmission.
A

Which statements correctly describe the purpose of Express Generator? (Choose 2 answers)
A. It sets up a project skeleton with the necessary files and folders.
B. It compiles JavaScript code into machine code.
C. It allows you to focus on building your application's features instead of setting up the initial boilerplate code.
D. It is used to manage user authentication and sessions.
AC

Which file extension is typically used for EJS templates?
A. .ejs
B. .html
C. .js
D. .tpl
A`;
