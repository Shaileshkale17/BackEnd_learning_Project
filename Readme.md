# Creating a new to Backend learning

### BackEnd learning Project

# Database Connection Setup

## Index.js

The `index.js` file contains code for connecting to the database and starting the server.

```
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_API}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log("ERROR", error);
      throw error;
    });
    app.listen(port, function () {
      console.log("Server is running on port " + port);
    });
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
})();

```

## src/db/index.js

The `index.js` file in the `src/db` directory contains code for connecting to the database.

```
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv";
dotenv.config();
export const ConnectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_API}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB connection error ", error);
    process.exit(1);
  }
};

```

## Instructions

- 1. Make sure to set up your environment variables, including `MONGODB_API` and `DB_NAME`, to properly connect to your MongoDB instance.
- 2. Use the `ConnectDB` function from `src/db/index.js` to establish a connection to the database.
- 3. Ensure that the necessary dependencies (`mongoose` and `dotenv`) are installed in your project.

---

# AsyncHandler Middleware Overview Error Handling

## Async Handler Function

The asyncHandler function is designed to simplify error handling in asynchronous Express route handlers. It wraps asynchronous route handler functions, allowing them to catch any errors that occur during their execution and pass them to Express's error handling middleware.

#### Usage

There are two implementations of the asyncHandler function provided:

###-First Implementation:

```
const asyncHandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};


```

This implementation takes a requestHandler function as an argument and returns a new function that wraps it. Inside this wrapper function, the original requestHandler is executed within a Promise. If an error occurs during the execution of the requestHandler, it is caught and passed to the next middleware function.

###-Second Implementation:

```
const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res
      .status(error.code || 500)
      .json({ success: false, message: error.message });
  }
};


```

This alternative implementation achieves the same purpose but utilizes async/await syntax for better readability. It takes an asynchronous function fn as an argument and returns a new asynchronous function that wraps it. Inside this wrapper function, the fn is awaited, and any errors are caught and handled by sending an appropriate response to the client.

## Example

Here's an example of how you can use the asyncHandler function with an Express route handler:

```
const express = require('express');
const asyncHandler = require('./asyncHandler');

const app = express();

const asyncRouteHandler = asyncHandler(async (req, res) => {
  // Asynchronous operations
  // Example: querying a database
  const data = await fetchDataFromDatabase();
  res.json({ success: true, data });
});

app.get('/route', asyncRouteHandler);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

```
