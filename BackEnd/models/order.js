const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const OrderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: String,
    name: String,
    quantity: Number,
  }],
  address: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = model('Order', OrderSchema);
