const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Populate relational fields
purchaseSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'id email',
  });
  next();
});

purchaseSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'product',
    select: 'title stripeId',
  });
  next();
});

module.exports =
  mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);
