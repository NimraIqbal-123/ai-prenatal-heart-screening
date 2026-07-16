const mongoose = require('mongoose');

// Replace <username>, <password>, <dbname> with your MongoDB Atlas credentials
const mongoURI = "mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected successfully"))
.catch((err) => console.log("MongoDB connection error:", err));