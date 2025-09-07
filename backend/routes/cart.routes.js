// routes/cart.routes.js
import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount
} from '../controllers/cart.controller.js'
import authenticate from '../middlewares/authenticate.js';

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

// GET /api/cart - Get user's cart
router.get('/', getCart);

// GET /api/cart/count - Get cart item count
router.get('/count', getCartCount);

// POST /api/cart/add - Add item to cart
router.post('/add', addToCart);

// PUT /api/cart/update - Update item quantity
router.put('/update', updateCartItem);

// DELETE /api/cart/remove/:productId - Remove specific item
router.delete('/remove/:productId', removeFromCart);

// DELETE /api/cart/clear - Clear entire cart
router.delete('/clear', clearCart);

export default router;