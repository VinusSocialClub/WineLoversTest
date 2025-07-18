const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const User = require('./models/user');
const Cart = require('./models/cart');
const Order = require('./models/order');

const app = express();
const PORT = process.env.PORT || 3000;

require('dotenv').config();

app.use(cors());
app.use(bodyParser.json());

const mongoURI = process.env.MONGO_URI || 'mongodb+srv://vinussocialclub:<db_password>@wineloversdb.aulcl99.mongodb.net/?retryWrites=true&w=majority&appName=WineLoversDB';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB conectado!'))
  .catch(err => console.error('Erro a conectar MongoDB:', err));

// --- Rotas ---

// Registo
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });

    if (existingEmail) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    if (existingUsername) {
      return res.status(400).json({ message: 'Username já está em uso' });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    // Retorna id, username e email para o frontend
    res.json({ message: 'Utilizador registado com sucesso!', user: { id: newUser._id, username, email } });
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor', error: err.message });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });

    if (user) {
      // Retorna id, username e email para o frontend
      res.json({ message: 'Login efetuado com sucesso!', user: { id: user._id, username: user.username, email } });
    } else {
      res.status(401).json({ message: 'Credenciais inválidas' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor', error: err.message });
  }
});

// Adicionar item ao carrinho
app.post('/cart', async (req, res) => {
  const { userId, items } = req.body;

  if (!userId || !items || !Array.isArray(items)) {
    return res.status(400).json({ message: 'Dados inválidos para o carrinho' });
  }

  try {
    // Procura se já existe carrinho para o user
    let userCart = await Cart.findOne({ userId });

    if (!userCart) {
      userCart = new Cart({ userId, items });
    } else {
      // Adicionar os items ao carrinho existente (exemplo simples)
      items.forEach(newItem => {
        const existingItem = userCart.items.find(item => item.productId === newItem.productId);
        if (existingItem) {
          existingItem.quantity += newItem.quantity;
        } else {
          userCart.items.push(newItem);
        }
      });
    }

    await userCart.save();

    res.json({ message: 'Itens adicionados ao carrinho', cart: userCart });
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor', error: err.message });
  }
});

// Ver carrinho do utilizador
app.get('/cart/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const userCart = await Cart.findOne({ userId });
    if (!userCart) return res.json({ items: [] });
    res.json(userCart);
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor', error: err.message });
  }
});

// Checkout
app.post('/checkout', async (req, res) => {
  const { userId, address } = req.body;

  if (!userId || !address) {
    return res.status(400).json({ message: 'Dados inválidos' });
  }

  try {
    const userCart = await Cart.findOne({ userId });
    if (!userCart || userCart.items.length === 0) {
      return res.status(400).json({ message: 'Carrinho vazio' });
    }

    const newOrder = new Order({
      userId,
      items: userCart.items,
      address,
    });

    await newOrder.save();

    // Limpar carrinho após encomenda
    await Cart.deleteOne({ userId });

    res.json({ message: 'Compra efetuada com sucesso!' });
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});

