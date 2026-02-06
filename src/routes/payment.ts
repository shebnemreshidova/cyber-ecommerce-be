import express from 'express';
import auth from '../middleware/auth';
import { AuthRequest } from './productRoutes';
const stripe = require('../config/stripe');

const router = express.Router();
const authMiddleware = auth();

 interface Product {
    _id: string;
    name: string;
    price: number;
    description: string;
    order: number;
    image?: string;
}
 interface CartProduct {
    quantity: number
    product: Product
}


router.post('/create-checkout-session', authMiddleware.authenticate(), async (req: AuthRequest, res) => {
    try {
        const cartItems = req.body;
        
        const lineItems = cartItems.map((item:CartProduct) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.product.name,
                    images: [item.product.image]
                },
                unit_amount: Math.round(item.product.price * 100)
            },
            quantity: item.quantity
        }))

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
            customer_email: req.user?.email,
            metadata: {
                userId: req.user?._id.toString(),
            },
        });
        
        res.json({ url: session.url }); 
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Server Error" });
    }
})




export default router;
