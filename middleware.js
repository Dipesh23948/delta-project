const Listing = require("./models/listing"); 
const { listingSchema, reviewSchema } = require("./schema");
const ExpressError = require("./utils/ExpressError");
const Review = require("./models/review");

// 🔐 Check login
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to create listing!");
        return res.redirect("/users/login");
    }
    next();  
};

// 🔁 Save redirect URL
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl;
    }
    next();
};

// 🧑‍💼 Check owner
module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;

    const listing = await Listing.findById(id).populate("owner");

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    if (!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

// ✅ 🔥 FIXED VALIDATION (MAIN CHANGE)
module.exports.validateListing = (req, res, next) => {

    // 🔥 Ensure category exists BEFORE Joi validation
    if (!req.body.listing || !req.body.listing.category || req.body.listing.category === "") {
        req.body.listing = req.body.listing || {};
        req.body.listing.category = "trending";
    }

    let { error } = listingSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// 📝 Validate review
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);  

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// ✍️ Check review author
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params; 

    const review = await Review.findById(reviewId).populate("author");

    if (!review) {
        req.flash("error", "Review not found");
        return res.redirect(`/listings/${id}`);
    }

    if (!review.author._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You did not create this review");
        return res.redirect(`/listings/${id}`);
    }

    next();
};