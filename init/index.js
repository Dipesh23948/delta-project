const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("connected to db");
}

main()
    .then(() => initDB())   
    .catch((err) => console.log(err));

const initDB = async () => {
    await Listing.deleteMany({});

    const ownerId = new mongoose.Types.ObjectId("69c129b825d98a1aa2861669");

    const updatedData = initData.data.map((obj) => ({
        ...obj,
        owner: ownerId,
    }));

    await Listing.insertMany(updatedData);

    console.log("data was initialized");
};