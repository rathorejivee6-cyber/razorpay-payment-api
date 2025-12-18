import express from "express";
import Razorpay from "razorpay";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Razorpay init (keys ENV से आएँगी)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// health check
app.get("/", (req, res) => {
  res.send("Razorpay Payment API is running ✅");
});

// create payment link
app.post("/create-payment", async (req, res) => {
  try {
    const { amount, reference_id } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "amount is required" });
    }

    const paymentLink = await razorpay.paymentLink.create({
      amount: amount * 100, // INR → paise
      currency: "INR",
      reference_id: reference_id || `bp_${Date.now()}`,
      description: "Coupon Payment",
      customer: {
        name: "Coupon Buyer"
      },
      notify: {
        sms: false,
        email: false
      }
    });

    res.json({
      success: true,
      payment_url: paymentLink.short_url
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
app.get("/test-order", async (req, res) => {
  res.json({
    message: "Server OK, next step payment order banayenge",
    status: "success"
  });
});
