const mongoose = require('mongoose');

const retentionSchema = new mongoose.Schema({
  uid: {
    type: Number,
    required: true,
    unique: true,
    index: true,
    ref: 'Customer'
  },
  retained_june: {
    type: Boolean,
    required: true,
    default: false
  },
  retained_july: {
    type: Boolean,
    required: true,
    default: false
  },
  retained_august: {
    type: Boolean,
    required: true,
    default: false
  },
  retained_90: {
    type: Boolean,
    required: true,
    default: false,
    comment: '90-day retention status'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'retentions'
});

// Indexes
retentionSchema.index({ uid: 1 }, { unique: true });
retentionSchema.index({ retained_june: 1 });
retentionSchema.index({ retained_july: 1 });
retentionSchema.index({ retained_august: 1 });
retentionSchema.index({ retained_90: 1 });

// Compound indexes for retention analysis
retentionSchema.index({ retained_june: 1, retained_july: 1 });
retentionSchema.index({ retained_june: 1, retained_july: 1, retained_august: 1 });
retentionSchema.index({ retained_90: 1, uid: 1 });

// Virtual to calculate total months retained
retentionSchema.virtual('months_retained').get(function() {
  let count = 0;
  if (this.retained_june) count++;
  if (this.retained_july) count++;
  if (this.retained_august) count++;
  return count;
});

// Virtual to check if customer is fully retained (all months)
retentionSchema.virtual('is_fully_retained').get(function() {
  return this.retained_june && this.retained_july && this.retained_august;
});

// Ensure virtuals are included in JSON output
retentionSchema.set('toJSON', { virtuals: true });
retentionSchema.set('toObject', { virtuals: true });

// Static method to get retention rate for a specific month
retentionSchema.statics.getRetentionRate = async function(month) {
  const fieldMap = {
    'june': 'retained_june',
    'july': 'retained_july',
    'august': 'retained_august',
    '90': 'retained_90'
  };

  const field = fieldMap[month.toLowerCase()];
  if (!field) {
    throw new Error('Invalid month. Use: june, july, august, or 90');
  }

  const total = await this.countDocuments();
  const retained = await this.countDocuments({ [field]: true });

  return {
    month,
    total,
    retained,
    rate: total > 0 ? ((retained / total) * 100).toFixed(2) : 0
  };
};

// Static method to get retention funnel
retentionSchema.statics.getRetentionFunnel = async function() {
  const total = await this.countDocuments();
  const june = await this.countDocuments({ retained_june: true });
  const july = await this.countDocuments({ retained_july: true });
  const august = await this.countDocuments({ retained_august: true });
  const ninety = await this.countDocuments({ retained_90: true });
  const fullyRetained = await this.countDocuments({
    retained_june: true,
    retained_july: true,
    retained_august: true
  });

  return {
    total,
    june: { count: june, rate: ((june / total) * 100).toFixed(2) },
    july: { count: july, rate: ((july / total) * 100).toFixed(2) },
    august: { count: august, rate: ((august / total) * 100).toFixed(2) },
    ninety_days: { count: ninety, rate: ((ninety / total) * 100).toFixed(2) },
    fully_retained: { count: fullyRetained, rate: ((fullyRetained / total) * 100).toFixed(2) }
  };
};

// Static method to find customers with specific retention pattern
retentionSchema.statics.findByRetentionPattern = function(pattern) {
  const query = {};
  if (pattern.june !== undefined) query.retained_june = pattern.june;
  if (pattern.july !== undefined) query.retained_july = pattern.july;
  if (pattern.august !== undefined) query.retained_august = pattern.august;
  if (pattern.ninety !== undefined) query.retained_90 = pattern.ninety;

  return this.find(query);
};

// Instance method to check if customer churned after first month
retentionSchema.methods.isChurned = function() {
  return this.retained_june && !this.retained_july;
};

// Instance method to check if customer returned after churning
retentionSchema.methods.hasReturned = function() {
  return this.retained_june && !this.retained_july && this.retained_august;
};

// Pre-save hook to validate retention logic
retentionSchema.pre('save', function(next) {
  // Optional: Add any validation logic here
  // For example, ensure that if retained_august is true, retained_june or retained_july should also be true
  next();
});

module.exports = mongoose.model('Retention', retentionSchema);
