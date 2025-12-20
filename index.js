import express from "express";
import Razorpay from "razorpay";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.get("/", (req, res) => {
  res.send("Razorpay Backend Running (No-Contact Mode) ✅");
});

app.post("/create-payment-link", async (req, res) => {
  try {
    const { amount, conversationId, quantity, couponType } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount required" });
    }

    const paymentLink = await razorpay.paymentLink.create({
      amount: amount * 100,
      currency: "INR",
      accept_partial: false,
      description: `Coupon: ${couponType} (Qty: ${quantity})`,
      
      // ✅ CHANGE HERE: Contact number hata diya hai
      customer: {
        name: "Valued Customer",
        email: "customer@example.com"
      },
      
      notify: {
        sms: true,
        email: true
      },
      reminder_enable: true,
      notes: {
        conversationId: String(conversationId || "no_id"),
        quantity: String(quantity || "1"),
        couponType: String(couponType || "default")
      },
      callback_url: "https://google.com",
      callback_method: "get",
    });

    res.json({
      success: true,
      payment_url: paymentLink.short_url,
      id: paymentLink.id
    });

  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({
      success: false,
      message: "Payment link error",
      details: error.error ? error.error.description : error.message
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
