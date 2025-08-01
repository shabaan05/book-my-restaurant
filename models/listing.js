const mongoose = require('mongoose');
const Review = require('./review');

const ListingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
img: {
  type: String,
  default: "https://media.istockphoto.com/id/610041376/photo/beautiful-sunrise-over-the-sea.jpg?s=612x612&w=0&k=20&c=R3Tcc6HKc1ixPrBc7qXvXFCicm8jLMMlT99MfmchLNA=",
  set: (v) => {
    return v === ""
      ? "https://media.istockphoto.com/id/610041376/photo/beautiful-sunrise-over-the-sea.jpg?s=612x612&w=0&k=20&c=R3Tcc6HKc1ixPrBc7qXvXFCicm8jLMMlT99MfmchLNA="
      : v;
  },
  validate: {
    validator: function (v) {
      return /^https:\/\//.test(v);
    },
    message: (props) => `${props.value} must start with https://`
  }
},

    price: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    reviews: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }
]



});


// In models/listing.js
ListingSchema.pre('findOneAndDelete', async function (next) {
  const listing = await this.model.findOne(this.getFilter());
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
  next();
});



const Listing = mongoose.model('Listing', ListingSchema);

module.exports = Listing;
