const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  area: {
    type: Number,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  rooms: {
    type: Number,
    required: true
  },
  beds: {
    type: Number,
    required: true
  },
  kitchens: {
    type: Number,
    required: true
  },
  bathrooms: {
    type: Number,
    required: true
  },
  image: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  neighbourhood: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

propertySchema.index({ location: '2dsphere' });

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
