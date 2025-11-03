const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  dateOfBirth: {
    type: Date
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastPurchaseDate: {
    type: Date
  },
  totalPurchases: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  customerTier: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
    default: 'Bronze'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active'
  },
  preferences: {
    newsletter: {
      type: Boolean,
      default: false
    },
    smsNotifications: {
      type: Boolean,
      default: false
    }
  },
  notes: String
}, {
  timestamps: true
});

// 인덱스 생성
customerSchema.index({ email: 1 });
customerSchema.index({ customerId: 1 });
customerSchema.index({ registrationDate: -1 });
customerSchema.index({ totalSpent: -1 });

module.exports = mongoose.model('Customer', customerSchema);
