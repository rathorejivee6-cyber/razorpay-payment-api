const express = require("express");
const Razorpay = require("razorpay");

const app = express();
app.use(express.json());

// Razorpay instance (TEST keys Render ENV me lage honi chahiye)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ HOME ROUTE (server check)
app.get("/", (req, res) => {
  res.send("Razorpay Payment API is running ✅");
});

// ✅ TEST ROUTE (browser test)
app.get("/test-order", (req, res) => {
  res.json({
    status: "success",
    message: "Server OK, payment system ready",
  });
});

// ✅ CREATE PAYMENT LINK (MAIN ROUTE)
app.post("/create-payment-link", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        error: "Amount is required",
      });
    }

    const paymentLink = await razorpay.paymentLink.create({
      amount: amount * 100, // rupees → paise
      currency: "INR",
      description: "Coupon Purchase",
      customer: {
        name: "Botpress User",
      },
      notify: {
        sms: false,
        email: false,
      },
    });

    res.json({
      success: true,
      payment_url: paymentLink.short_url,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ✅ SERVER START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
