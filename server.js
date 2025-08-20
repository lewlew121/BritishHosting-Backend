const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors({
origin: process.env.FRONTEND_URL,
methods: ['GET', 'POST'],
}));


app.use(express.json());


app.get('/', (req, res) => {
res.send('Backend is live ✅');
});


app.post('/create-checkout', async (req, res) => {
try {
const { items } = req.body;


const session = await stripe.checkout.sessions.create({
payment_method_types: ['card'],
line_items: items.map(item => ({
price_data: {
currency: 'usd',
product_data: { name: item.name },
unit_amount: item.price * 100,
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