const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  uid: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  region_city_group: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  region_city: {
    type: String,
    required: true,
    trim: true
  },
  age_group: {
    type: String,
    required: true,
    enum: ['Teens', 'Twenties', 'Thirties', 'Forties+'],
    index: true
  },
  age: {
    type: Number,
    required: true,
    min: 0,
    max: 150
  },
  visit_days: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  total_duration_min: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  total_payment_may: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    comment: 'Payment amount in Korean Won (₩)'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'customers'
});

// Single field indexes
customerSchema.index({ uid: 1 }, { unique: true });
customerSchema.index({ region_city_group: 1 });
customerSchema.index({ age_group: 1 });

// Compound indexes for common queries
customerSchema.index({ region_city_group: 1, age_group: 1 });
customerSchema.index({ total_payment_may: -1, visit_days: -1 });

// Additional useful indexes
customerSchema.index({ visit_days: -1 });
customerSchema.index({ total_duration_min: -1 });
customerSchema.index({ created_at: -1 });

// Virtual for calculating average payment per visit
customerSchema.virtual('avg_payment_per_visit').get(function() {
  if (this.visit_days === 0) return 0;
  return Math.round(this.total_payment_may / this.visit_days);
});

// Virtual for calculating average duration per visit
customerSchema.virtual('avg_duration_per_visit').get(function() {
  if (this.visit_days === 0) return 0;
  return Math.round(this.total_duration_min / this.visit_days);
});

// Ensure virtuals are included in JSON output
customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });

// Static method to get customers by region and age group
customerSchema.statics.findByRegionAndAge = function(region, ageGroup) {
  return this.find({
    region_city_group: region,
    age_group: ageGroup
  }).sort({ total_payment_may: -1 });
};

// Static method to get high-value customers
customerSchema.statics.findHighValueCustomers = function(minPayment = 100000) {
  return this.find({
    total_payment_may: { $gte: minPayment }
  }).sort({ total_payment_may: -1 });
};

// Instance method to check if customer is high-frequency visitor
customerSchema.methods.isHighFrequencyVisitor = function() {
  return this.visit_days >= 10;
};

// Instance method to get customer tier based on payment
customerSchema.methods.getCustomerTier = function() {
  if (this.total_payment_may >= 500000) return 'Diamond';
  if (this.total_payment_may >= 300000) return 'Platinum';
  if (this.total_payment_may >= 150000) return 'Gold';
  if (this.total_payment_may >= 50000) return 'Silver';
  return 'Bronze';
};

module.exports = mongoose.model('Customer', customerSchema);
