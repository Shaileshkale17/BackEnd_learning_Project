# Creating a new to Backend learning

### BackEnd learning Project

## this code for index.js page to connect to DB

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

## this code for src\db\index.js page to connect to DB

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
