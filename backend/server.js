import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';

import userRoutes from './routes/user.routes.js'
import productRoutes from './routes/product.routes.js'
import cartRoutes from './routes/cart.routes.js'

dotenv.config()
const app = express();

app.use(cors({
  origin: ["https://my-store-lilac-seven.vercel.app","http://localhost:5173"],
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true })); // For URL-encoded requests

//routes
app.use('/api/user' , userRoutes)
app.use('/api/products' , productRoutes)
app.use('/api/cart' , cartRoutes)


app.get('/', (req, res) => {
    res.send('Hello, World!');
});

//db connection
connectDB()


const port = process.env.PORT || 3000;
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
