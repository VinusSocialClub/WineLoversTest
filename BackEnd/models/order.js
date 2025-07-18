const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const OrderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  }],
  address: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = model('Order', OrderSchema);
