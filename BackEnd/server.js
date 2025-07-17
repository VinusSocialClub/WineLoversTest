const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const User = require('./models/User');
const Cart = require('./models/Cart');
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 3000;

// Carregar variáveis de ambiente (se usares .env)
require('dotenv').config();

app.use(cors());
app.use(bodyParser.json());

// Conexão MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://vinussocialclub:<db_password>@wineloversdb.aulcl99.mongodb.net/?retryWrites=true&w=majority&appName=WineLoversDB';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB conectado!'))
  .catch(err => console.error('Erro a conectar MongoDB:', err));

// --- Rotas ---

// Registo (guardar novo utilizador)
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
      // Verifica se utilizador já existe
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Utilizador já existe' });
      }

      const newUser = new User({ username, password });
      await newUser.save();
      res.json({ message: 'Utilizador registado com sucesso!' });
    } catch (err) {
      res.status(500).json({ message: 'Erro no servidor', error: err.message });
    }
});

// Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username, password });
      if (user) {
        res.json({ message: 'Login efetuado com sucesso!' });
      } else {
        res.status(401).json({ message: 'Credenciais inválidas' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Erro no servidor', error: err.message });
    }
});

// Adicionar item ao carrinho
app.post('/cart', async (req, res) => {
    const cartItem = req.body;

    try {
      const newCartItem = new Cart(cartItem);
      await newCartItem.save();

      const allCartItems = await Cart.find();
      res.json({ message: 'Item adicionado ao carrinho', cart: allCartItems });
    } catch (err) {
      res.status(500).json({ message: 'Erro no servidor', error: err.message });
    }
});

// Ver carrinho
app.get('/cart', async (req, res) => {
    try {
      const allCartItems = await Cart.find();
      res.json(allCartItems);
    } catch (err) {
      res.status(500).json({ message: 'Erro no servidor', error: err.message });
    }
});

// Checkout (finalizar compra)
app.post('/checkout', async (req, res) => {
    const { name, address } = req.body;

    if (!name || !address) {
      return res.status(400).json({ message: 'Dados inválidos' });
    }

    try {
      // Guardar order
      const cartItems = await Cart.find();
      const newOrder = new Order({ name, address, items: cartItems });
      await newOrder.save();

      // Limpar carrinho
      await Cart.deleteMany();

      res.json({ message: 'Compra efetuada com sucesso!' });
    } catch (err) {
      res.status(500).json({ message: 'Erro no servidor', error: err.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
});
