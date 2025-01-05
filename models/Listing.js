import mongoose from 'mongoose';

const { Schema } = mongoose;

const ListingSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    age: {
      type: String,
      required: true,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    photos: [
      {
        type: String,
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    useWhatsApp: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['published', 'paused', 'underReview', 'expired', 'blocked'],
      default: 'underReview',
      required: true,
    },
    reports: { type: Number, default: 0 },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    validUntil: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default: 30 days from now
    },
  },
  { timestamps: true }
);

ListingSchema.pre('save', function (next) {
  // Check if the 'reports' count exceeds a threshold
  if (this.reports >= 5) {
    this.status = 'blocked'; // Update the status to 'blocked'
  }
  next(); // Call next to proceed with the save operation
});

const Listing = mongoose.model('Listing', ListingSchema);

export default Listing;
