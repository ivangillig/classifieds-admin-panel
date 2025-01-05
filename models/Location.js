import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  subcountry: { type: String, required: true },
  geonameid: { type: Number, required: true }
});

const Location = mongoose.model('Location', locationSchema);

export default Location;
