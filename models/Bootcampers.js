const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");

const bootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, "Please enter Name"],
        trim: true,
        maxlength: [50, "Name should be less than 50 characters"]
    },

    // this is for the url friendly api in the frontend
    slug: String,
    description: {
        type: String,
        required: [true, " Please enter Description"],
        trim: true,
        maxlength: [500, "Description should be less than 500 characters"]
    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            "The website must be some URL"
        ]
    },
    phone: {
        type: String,
        maxlength: [20, "Phone number must be less than 20"],
        required: [true, " Please enter phone number"]
    },
    email: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please add a valid email"
        ]
    },
    address: {
        type: String,
        required: [true, "Please add an address"]
    },
    location: {
        // GeoJSON Point
        type: {
            type: String,
            enum: ["Point"]
        },
        coordinates: {
            type: [Number],
            index: "2dsphere"
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    careers: {
        // Array of strings
        type: [String],
        required: true,
        enum: [
            "Web Development",
            "Mobile Development",
            "UI/UX",
            "Data Science",
            "Business",
            "Other"
        ]
    },
    averageRating: {
        type: Number,
        min: [1, "Rating must be at least 1"],
        max: [10, "Rating must can not be more than 10"]
    },
    averageCost: Number,
    photo: {
        type: String,
        default: "no-photo.jpg"
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

//mongoose hooks/middleware
//using function here instead of arrow func because of scope
bootcampSchema.pre("save", function(next) {
    this.slug = slugify(this.name, {
        lower: true
    });
    next();
});

// mongoose middleware for the address
bootcampSchema.pre("save", async function(next) {
    const loc = await geocoder.geocode(this.address);
    this.location = {
        type: "Point",
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    };

    // dont save address in DB
    this.address = undefined;
    next();
});

// mongoose middleware to delete courses when bootcamp is deleted
// CASCADE DELETE
bootcampSchema.pre("remove", async function(next) {
    await this.model("Course").deleteMany({ bootcamp: this._id });
    console.log("COURSES BEIGN DELETED FROM BOOTCAMP");
    next();
});

// reverse populate with virtuals
//field you want to add, and some options
bootcampSchema.virtual("courses", {
    ref: "Course",
    localField: "_id",
    foreignField: "bootcamp",
    justOne: false
});

module.exports = mongoose.model("Bootcamp", bootcampSchema);