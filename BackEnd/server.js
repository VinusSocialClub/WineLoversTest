const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('./models/user');
const Cart = require('./models/cart');
const Order = require('./models/order');

const app = express();
const PORT = process.env.PORT || 3000;

require('dotenv').config();

app.use(cors());
app.use(bodyParser.json());

// Conexão MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://vinussocialclub:<db_password>@wineloversdb.aulcl99.mongodb.net/?retryWrites=true&w=majority&appName=WineLoversDB';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB conectado!'))
  .catch(err => console.error('Erro a conectar MongoDB:', err));

// --- Rotas ---

// Registo
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Preencha todos os campos' });
  }

  try {
    // Verificar email ou username já usados
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email já está em uso' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username já está em uso' });
      }
    }

    // Fazer hash da password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Utilizador registado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor', error: err.message });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Por favor, insira email e password' });

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.status(401).json({ message: 'Credenciais inválidas' });

    // Comparar password com hash guardado
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ message: 'Credenciais inválidas' });

    res.json({ message: 'Login efetuado com sucesso!', username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor', error: err.message });
  }
});

// As outras rotas (cart, checkout) mantém-se iguais

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

// Checkout
app.post('/checkout', async (req, res) => {
  const { name, address } = req.body;

  if (!name || !address) {
    return res.status(400).json({ message: 'Dados inválidos' });
  }

  try {
    const cartItems = await Cart.find();
    const newOrder = new Order({ name, address, items: cartItems });
    await newOrder.save();

    await Cart.deleteMany();

    res.json({ message: 'Compra efetuada com sucesso!' });
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
