const mongoose = require('mongoose');
const Listing = require('../models/listing');
const initData = require('./data'); // Import the array

const mongo_url = "mongodb://127.0.0.1:27017/wander_lust"
// MongoDB Connection
async function main(){
mongoose.connect(mongo_url)
}
  main().then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('DB Connection Error:', err));

    // fumction to command mongo
    const initDB = async () => {
        await Listing.deleteMany({});
        await  Listing.insertMany(initData.data);
        console.log("data initilised");

    }

    initDB();