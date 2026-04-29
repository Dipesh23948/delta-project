const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");

const { isLoggedIn, isOwner } = require("../middleware");

const listingController = require("../controllers/listings.js");

const multer  = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


// INDEX + CREATE
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single('listing[image]'),
        wrapAsync(listingController.createListing)
    );


// FILTER
router.get("/filter", wrapAsync(async (req, res) => {
    const { category } = req.query;

    const Listing = require("../models/listing");

    let listings = category
        ? await Listing.find({ category })
        : await Listing.find({});

    res.json(listings);
}));


// NEW
router.get("/new", isLoggedIn, listingController.renderNewForm);


// SHOW, UPDATE, DELETE
router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.single('listing[image]'),
        wrapAsync(listingController.updateListings)
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroyListing)
    );


// EDIT
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm)
);

module.exports = router;