const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    title: {
        type: String,
        minlength: 5,
        maxlength: 50,
        trim: true,
        required: [true, "Please enter title"]
    },
    text: {
        type: String,
        required: [true, "Enter text"]
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, "Give Rating First!"]
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: "Bootcamp",
        required: true
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
});


// prevent user to add more than one review per bootcamp
reviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true })


// creating average reviews here
// creating static method to cal avg ratings
reviewSchema.statics.getAverageRating = async function(bootcampId) {
    console.log("Calculating Average Rating....".blue.inverse);

    // aggregation here and match and group are pipeline of it
    const obj = await this.aggregate([{
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: "$bootcamp",
                averageRating: { $avg: "$rating" }
            }
        }
    ]);

    // saving here
    try {
        await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
            // obj gives [{id:,  averageRaing: }]
            averageRating: (obj[0].averageRating).toFixed(2)
        });
    } catch (e) {
        console.log(e);
    }
};


// call getAverageCost after save
reviewSchema.post("save", function() {
    // static method thats why calling in direct on constructor (PARENT)

    this.constructor.getAverageRating(this.bootcamp);

});

// call getAverageCost before remove
reviewSchema.pre("remove", function() {
    this.constructor.getAverageRating(this.bootcamp);
});


module.exports = mongoose.model("review", reviewSchema);