import "dotenv/config";
import app from "./app.js";
import { connectToDatabase } from "./db/connection.js";

//connections and listeners
const PORT = process.env.PORT || 5000;

connectToDatabase()
  .then(() => {
    const server = app.listen(PORT, () =>
      console.log(`Server open and connected to database on port ${PORT}`)
    );

    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Stop the existing server or set PORT to another value.`
        );
        process.exit(1);
      }

      throw error;
    });
  })
  .catch((err) => console.log(err));
