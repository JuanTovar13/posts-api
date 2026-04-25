import express, { Router } from 'express';
import { NODE_ENV, PORT } from './config';
import cors from 'cors';
import { errorsMiddleware } from './middlewares/errorsMiddleware';
import { authRouter } from "./features/auth/auth.router"
import { usersRouter } from "./features/users/users.router"
import { storesRouter } from "./features/stores/store.router"
import {productsRouter} from "./features/products/product.router"
import { ordersRouter } from "./features/orders/order.router"
import { deliveryRouter } from "./features/deliveries/delivery.router"
import { itemsRouter } from "./features/order-items/items.router";

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello, World!!!!!');
});

// Routes
app.use('/api/auth',        authRouter);
app.use('/api/users',       usersRouter);
app.use('/api/stores',      storesRouter);
app.use('/api/products',    productsRouter);
app.use('/api/orders',      ordersRouter);
app.use('/api/delivery',    deliveryRouter);
app.use('/api/order-items', itemsRouter);






// Error Handling Middleware
app.use(errorsMiddleware);

if (NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('Server is running on http://localhost:' + PORT);
  });
}

export default app;
