const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');
const ExpressError = require('./utils/ExpressError');
const wrapAsync = require('./utils/wrapAsync');
const Review = require('./models/review.js'); 
const Listing  = require("./models/listing.js");
const { title } = require('process');
const app = express();
const engine = require('ejs-mate'); 
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user'); // make sure the path is correct


// const MongoStore = require('connect-mongo');


const mongo_url = "mongodb://127.0.0.1:27017/wander_lust"
// MongoDB Connection
async function main(){
mongoose.connect(mongo_url)
}
  main().then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('DB Connection Error:', err));

// Middlewares
app.engine('ejs', engine);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));


// session 
app.use(session({
  secret: 'thisshouldbeabettersecret', // use env variable in real apps
  resave: false,
  saveUninitialized: true,
     cookie: {
        maxAge: 1000 * 60 * 60 * 24, 
        httpOnly: true,             
        secure: false,              
        // sameSite: 'lax'           
    }
}));
// signup passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// flash middleware
app.use(flash());

// storing something to show in cookie in browser
app.get('/set-session', (req, res) => {
  req.session.username = 'Shabaan';
  res.send('Session set!');
});
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// signup routes
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            res.redirect('/listings');
        });
    } catch (e) {
        res.send('Error: ' + e.message);
    }
});


// Routes
app.get("/",(req,res) =>{
     res.send("hi i am robot");
});

app.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  req.flash('success', 'Listing created successfully!');

  res.render("index.ejs", { allListings });
}));


// Show Route 
app.get('/listings/:id', wrapAsync(async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  const review1 = await Listing.findById(req.params.id).populate('reviews');
  if (!listing) {
    return next(new ExpressError("Listing Not Found", 404));
  }
  console.log(listing)
  res.render('show', { listing,review1 });
}));


// Form to create new chat
app.get('/testListing',async (req, res) => {
    let sampleListing = new Listing(
        {
            title: "my new villa",
            description:"by the beach",
            price:1200,
            location:"goa gm road",
            country:"india",

        }
    );
  await  sampleListing.save();
  console.log("sample saved")
    res.send('working');
});

// create
app.get('/listings/new', (req, res) => {
    res.render('create.ejs');  
});

// POST Route - Save to database
app.post('/listings', async (req, res) => {
        const listingData = req.body.listing;

    const newListing = new Listing(listingData);  // Create new listing
    await newListing.save();  // Save to MongoDB
    res.redirect('/listings');  // Redirect to listings page after saving
});

// update 
// EDIT FORM - show form with pre-filled data
app.get('/listings/:id/edit', wrapAsync(async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    return next(new ExpressError('Listing Not Found', 404));
  }
  res.render('edit.ejs', { listing });
}));


// UPDATE Route - Save updated data and redirect to all listings
app.post('/listings/:id', wrapAsync(async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body.listing;
  await Listing.findByIdAndUpdate(id, updatedData, { runValidators: true });
  res.redirect('/listings');
}));


// DELETE Route
app.post('/listings/:id/delete', wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash('success', 'Listing deleted successfully!');

  res.redirect('/listings');
}));

app.use((err, req, res, next) => {
  const { status = 500, message = 'Something went wrong!' } = err;
  res.status(status).render('error', { status, message });
});

//............................................routes for reviews
app.get('/listings/:id/reviews/new', async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render('reviews/create.ejs', { listing });
});

app.post('/listings/:id/reviews', async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).send("Listing not found");

  const review = new Review(req.body.review);
  review.listing = listing._id; // ✅ Add this line

listing.reviews.push(review);
  await review.save();
  await listing.save();

  res.redirect(`/listings/${listing._id}`);
});
// delete reviews route
app.delete('/listings/:id/reviews/:reviewId', async (req, res) => {
  const { id, reviewId } = req.params;

  // 1. Remove the review reference from the listing
  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId }
  });

  // 2. Delete the review document itself
  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`);
});



// Start Server 
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
