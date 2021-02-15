const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    stripeId: {
      type: String,
      required: [true, 'Stripe ID is required'],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports =
  mongoose.models.Product || mongoose.model('Product', productSchema);
