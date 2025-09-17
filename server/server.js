import {server as app} from "./app.js";
import connectDB from "./config/db.js";

// Connect to the database
connectDB();

// Start the server
app.listen(process.env.PORT, () =>
  console.log(`Server is running on http://localhost:${process.env.PORT}`)
);
