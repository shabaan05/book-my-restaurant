const mongoose = require("mongoose");

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/shopApp")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Mongo error:", err));

// 📦 Order Schema
const orderSchema = new mongoose.Schema({
  item: String,
  price: Number
});
const Order = mongoose.model("Order", orderSchema);

// 👤 Customer Schema (Referencing Orders)
const customerSchema = new mongoose.Schema({
  name: String,
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order"
    }
  ]
});
const Customer = mongoose.model("Customer", customerSchema);

// 🔸 Function: Add Customer with Orders using push
const addCustomer = async () => {
  // Step 1: Create Orders
  const order1 = new Order({ item: "Keyboard", price: 2000 });
  const order2 = new Order({ item: "Mouse", price: 1000 });
  await order1.save();
  await order2.save();

  // Step 2: Create Customer and push orders
  const customer = new Customer({ name: "Ravi" });
  customer.orders.push(order1._id, order2._id);  // 👈 Using push here
  await customer.save();

  console.log("Customer created with orders:\n", customer);
};

// 🔍 View customer with populated orders
const showCustomer = async () => {
  const customer = await Customer.findOne({ name: "Ravi" }).populate("orders");
  console.log("Populated customer:\n", customer);
};

// ✅ Run
const run = async () => {
  await addCustomer();
  await showCustomer();
};

run();
