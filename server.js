const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
app.use(express.json());
app.use(cors());

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_RmbMCiiHISeIHG",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "Bb1wTeLbtjX2HI9HkFxe1BAA",
});

// Create Order API
app.post("/create-order", async (req, res) => {
    try {
        const { amount } = req.body; // amount in rupees

        const options = {
            amount: amount * 100, // convert to paise
            currency: "INR",
            receipt: "receipt_order_74394",
        };

        const order = await razorpay.orders.create(options);
        res.json(order);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});

// Verify Payment API
app.post("/verify-payment", (req, res) => {
    const { order_id, payment_id, signature } = req.body;

    const body = order_id + "|" + payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "Bb1wTeLbtjX2HI9HkFxe1BAA")
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === signature) {
        return res.json({ success: true });
    }

    res.json({ success: false });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
