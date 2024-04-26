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

# ApiError Class

The `ApiError` class is designed to handle errors that occur within an API context. It extends the built-in `Error` class and allows you to specify an HTTP status code, a message, and any additional errors that occurred.

## Usage

To create a new `ApiError` instance, you can use the constructor function and provide the following parameters:

- 1. `statusCode`: The HTTP status code associated with the error.
- 2. `message` (optional): A descriptive message explaining the error. If not provided, a default message of `"Something went wrong"` will be used.
- 3. `errors` (optional): An array containing any additional errors that occurred.
- 4. `stack` (optional): The stack trace of the error.

```
const { ApiError } = require('./ApiError');

const statusCode = 404;
const message = 'Resource not found';
const errors = [{ field: 'id', message: 'Invalid ID' }];

const error = new ApiError(statusCode, message, errors);

```

### Properties

- `statusCode`: The HTTP status code associated with the error.
- `message`: A descriptive message explaining the error.
- `data`: Additional data associated with the error (currently set to `null`).
- `errors`: An array containing any additional errors that occurred.
- `success`: Indicates whether the operation was successful (`false` for errors).

### Example

```
try {
  // Some code that might throw an error
} catch (error) {
  const apiError = new ApiError(500, 'Internal Server Error', [], error.stack);
  console.error(apiError);
}

```

# ApiResponse Class

The `ApiResponse` class is designed to encapsulate the response format for HTTP requests in JavaScript applications. It provides a standardized structure for conveying the status, data, and message of an API response.

## Usage

To use the `ApiResponse` class, simply instantiate it with the appropriate parameters:

```
const response = new ApiResponse(statusCode, data, message);

```

- `statusCode`: The HTTP status code of the response.
- `data`: The payload of the response.
- `message`: An optional message describing the response status. Defaults to `"success"` if not provided.

## Example

```
const response = new ApiResponse(200, { id: 1, name: "John Doe" });
console.log(response);

```

## Properties

- `statusCode`: The HTTP status code of the response.
- `data`: The payload of the response.
- `message`: A message describing the response status.
- `success`: A boolean indicating whether the response is successful (`true` for status codes < 400).

```

{
  statusCode: 200,
  data: { id: 1, name: "John Doe" },
  message: "success",
  success: true
}

```

---

# Data model Image

![Data Model Image](https://lh3.googleusercontent.com/pw/AP1GczOhkjYsdddMwe153GrEjn6uift8O8_TxJBZXv2rZdWkcjd1fH8I5KQ8B-aQvInW42PBlwXrYyvt6ofFpT72Ki8SUKTty_3cID82fn9hqgbAa4D7vPSIPB--tyVj0M3YBjviLQObMbT3i5L1XWs6u2Fx=w1324-h730-s-no-gm?authuser=0)

# User Model

## Create User model Schema

```
const userschema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    ........
  },
  { timestamps: true }
);
```

## Passwords Modified in `Hash Code`

```
userschema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hash(this.password, n);
  next();
});

```

## Passwords chack To `Hash Code` in `user sending Password`

```
userschema.method.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

```

## Generating `Access Token`

```
userschema.method.generateAccessToken = function () {
  return Jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

```

## Generating `Refresh Token`

```
userschema.method.generateRefreshToken = function () {
  return Jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

```

# file uploading in server side

## NPM Package's

1. **Cloudinary**

```
npm install cloudinary
```

2. **Multer**

```
 npm install multer
```

## Cloudinary setup API connection

```
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// file uploading in cloudinary

const uploadincloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has uploaded successfully
    console.log("file is uploaded successfully", response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the lacally saved temporary file as the upload operation got failed
    return null;
  }
};

export { uploadincloudinary };

```

## Multer Setup

```
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cd(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    /* ! is using for naming creation
     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    */


    cb(null, file.originalname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage });
```

### **creting the file name by this function**

```
     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
```
