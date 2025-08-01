const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/testApp", {
 
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log("Connection Error:", err));

// Address Schema (Embedded)
const addressSchema = new mongoose.Schema({
  location: { type: String, required: true },
  city: String
});

// User Schema (Parent)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  addresses: [addressSchema] // Embedded array of addresses
});

const User = mongoose.model("User", userSchema);

// Add and save user with addresses for this we made object 
const addUsers = async () => {
  let user1 = new User({
    name: "Sherlock Holmes",
    addresses: [
      {
        location: "Kasarwadi Road, Barshi",
        city: "Barshi"
      }
    ]
  });

  // Add another address
  user1.addresses.push({
    location: "Kasba Bawda",
    city: "Kolhapur"
  });

  const result = await user1.save();
  console.log("User Saved:\n", result);
};

addUsers();

module.exports = User;
