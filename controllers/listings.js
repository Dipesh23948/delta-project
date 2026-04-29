const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// Index
module.exports.index = async (req, res) => {
    const { category } = req.query;

    let allListings = category
        ? await Listing.find({ category })
        : await Listing.find({});

    res.render("listings/index", { allListings, category });
};

// Render new
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};

// Show
module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" }
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

// Create
module.exports.createListing = async (req, res) => {
    try {
        let response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        }).send();

        if (!req.file) {
            req.flash("error", "Image upload failed!");
            return res.redirect("/listings/new");
        }

        let data = req.body.listing || {};

        // ensure category always exists
        if (!data.category) data.category = "trending";

        let newListing = new Listing(data);

        newListing.owner = req.user._id;
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };

        // safe geometry assignment (prevents crash)
        newListing.geometry = response.body.features[0]?.geometry;

        let saveListing = await newListing.save();
        console.log(saveListing); 

        req.flash("success", "New listing created!");
        res.redirect("/listings");

    } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong!");
        res.redirect("/listings/new");
    }
};

// Edit
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url.replace("/upload", "/upload/w_250");

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// Update
module.exports.updateListings = async (req, res) => {
    try {
        let { id } = req.params;

        let data = req.body.listing || {};

        // ensure category always exists
        if (!data.category) data.category = "trending";

        let listing = await Listing.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        );

        if (req.file) {
            listing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
            await listing.save();
        }

        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);

    } catch (err) {
        console.log(err);
        req.flash("error", "Update failed!");
        res.redirect("/listings");
    }
};

// Delete
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};