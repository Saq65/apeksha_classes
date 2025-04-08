import app from "./App.js";
import dotenv from "dotenv";
import { DatabaseConnection } from "./config/db.js";

dotenv.config({ path: "config/config.env" });
DatabaseConnection();
dotenv.config();
process.on('uncaughtException',(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Server is shutting down, due to uncaught Exception error`);
    process.exit(1);
});

const port = process.env.PORT || 3000

const server = app.listen(port, () => {
    console.log(`server is running on ${port} `);
});


process.on('unhandledRejection',(err)=>{
    console.log(`Error ${err.message}`);
    console.log(`Server is shutting down, due to unhandle promise rejection error`);
    server.close(()=>{
        process.exit(1)
    })
});
