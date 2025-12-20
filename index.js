import express from "express";
import Razorpay from "razorpay";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Razorpay instance (Environment Variables se keys lega)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Test Route
app.get("/", (req, res) => {
  res.send("Razorpay Backend Running with Notes Support ✅");
});

// === MAIN PAYMENT ROUTE (UPDATED) ===
app.post("/create-payment-link", async (req, res) => {
  try {
    // 1. Botpress se hume ye sab data milega
    const { amount, conversationId, quantity, couponType } = req.body;

    // Check agar amount nahi aya
    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount required" });
    }

    // 2. Razorpay Link Create karna (Notes ke sath)
    const paymentLink = await razorpay.paymentLink.create({
      amount: amount * 100, // ₹ to paise convert kiya
      currency: "INR",
      accept_partial: false,
      description: `Coupon: ${couponType} (Qty: ${quantity})`,
      customer: {
        name: "Valued Customer",
        email: "customer@example.com",
        contact: "9999999999"
      },
      notify: {
        sms: true,
        email: true
      },
      reminder_enable: true,
      // ✅ IMP: Ye 'notes' data wapas Make.com ke paas aayega
      notes: {
        conversationId: String(conversationId || "no_id"), // User ki ID
        quantity: String(quantity || "1"),                 // Kitne Coupon
        couponType: String(couponType || "default")        // Konsa Coupon
      },
      callback_url: "https://google.com", // Payment ke baad user yahan jayega
      callback_method: "get",
    });

    // 3. Link wapas bhejna Botpress ko
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
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
