const express = require("express");
const Razorpay = require("razorpay");

const app = express();
app.use(express.json());

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// HOME ROUTE (check server)
app.get("/", (req, res) => {
  res.send("Razorpay Payment API is running ✅");
});

// TEST ROUTE (browser test)
app.get("/test-order", (req, res) => {
  res.json({
    status: "success",
    message: "Server OK, next step payment order banayenge",
  });
});

// CREATE ORDER (actual payment – POST)
app.post("/create-order", async (req, res) => {
  try {
    const options = {
      amount: 100 * 100, // ₹100 (paise me)
      currency: "INR",
      receipt: "receipt_001",
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// SERVER START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
