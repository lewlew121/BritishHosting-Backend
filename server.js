import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Stripe from 'stripe'

dotenv.config()
const app = express()
app.use(express.json())

// CORS – allow your frontend origin
app.use(cors({ origin: process.env.FRONTEND_URL?.split(',') || true }))

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Mirror these with the frontend
const rules = {
  base: 150,                 // £1.50 in pence
  perPlayer: 3,              // £0.03 per player
  perRamGb: 100,             // £1.00 per GB
  perStorageGb: 2,           // £0.02 per GB
  support: { standard: 0, priority: 300, premium: 700 },
  regionFactor: { london: 1.0, frankfurt: 1.0, dallas: 1.0 }
}

function calcPricePence({ players, ram, storage, support, region }){
  const p = Math.round(
    rules.base +
    players * rules.perPlayer +
    ram * rules.perRamGb +
    storage * rules.perStorageGb +
    (rules.support[support] ?? 0)
  ) * (rules.regionFactor[region] ?? 1.0)
  return Math.round(p)
}

app.post('/create-checkout', async (req, res) => {
  try {
    const { players, ram, storage, support, region } = req.body || {}
    if(!players || !ram || !storage || !support || !region){
      return res.status(400).json({ error: 'Missing fields' })
    }

    const amount = calcPricePence({ players, ram, storage, support, region })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'], // card only
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'Custom Game Server',
            description: `Players:${players}, RAM:${ram}GB, Storage:${storage}GB, Support:${support}, Region:${region}`,
            metadata: { players: String(players), ram: String(ram), storage: String(storage), support, region }
          },
          unit_amount: amount
        },
        quantity: 1
      }],
      success_url: (process.env.FRONTEND_URL || 'http://localhost:5173') + '/success',
      cancel_url: (process.env.FRONTEND_URL || 'http://localhost:5173') + '/#pricing',
      billing_address_collection: 'auto',
      allow_promotion_codes: false,
      metadata: { players: String(players), ram: String(ram), storage: String(storage), support, region }
    })

    res.json({ id: session.id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

const port = process.env.PORT || 3001
app.listen(port, () => console.log('British Hosting backend listening on', port))
