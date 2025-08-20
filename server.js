// server.js
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for your Netlify frontend
app.use(cors({
    origin: 'https://jolly-paletas-fa7615.netlify.app', // your Netlify site
    methods: ['GET', 'POST'],
}));

app.use(express.json());

// Simple root check to confirm backend is live
app.get('/', (req, res) => {
    res.send('Backend is live ✅');
});

// Create Checkout Session endpoint
app.post('/create-checkout', async (req, res) => {
    try {
        const { items } = req.body; // frontend sends selected items

        // Example: calculate total from items
        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items.map(item => ({
                price_data: {
                    currency: 'usd', // change if needed
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: item.price * 100, // Stripe expects cents
                },
                quantity: item.quantity,
            })),
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}?success=true`,
            cancel_url: `${process.env.FRONTEND_URL}?canceled=true`,
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
