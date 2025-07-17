const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const CartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: String,
    name: String,
    quantity: Number,
  }],
});

module.exports = model('Cart', CartSchema);
