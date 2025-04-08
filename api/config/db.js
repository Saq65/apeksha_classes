import mongoose from "mongoose";

export const DatabaseConnection = () => {
    mongoose.connect(process.env.DB_URI)
    .then(data => {
        console.log(`MongoDB connected with saqlain server: ${data.connection.host}`);
    })

};
