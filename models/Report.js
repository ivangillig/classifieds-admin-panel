import mongoose from "mongoose";

const { Schema } = mongoose;

const ReportSchema = new Schema(
  {
    listingId: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    additionalInfo: {
      type: String,
      required: false,
    },
    contactInfo: {
      type: String,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", ReportSchema);

export default Report;
