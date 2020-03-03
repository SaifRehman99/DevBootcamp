const mongoose = require("mongoose");
const colors = require("colors");

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, "Please add title"]
    },
    description: {
        type: String,
        required: [true, "Please add description"]
    },
    weeks: {
        type: String,
        required: [true, "Please add numbers of weeks"]
    },
    tuition: {
        type: Number,
        required: [true, "Please add tuition cost"]
    },
    minimumSkill: {
        type: String,
        required: [true, "Please add Skills set"],
        enum: ["beginner", "intermediate", "advance"]
    },
    scholarhipsAvailable: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
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
    }
});

// creating static method to cal avg cost
courseSchema.statics.getAverageCost = async function(bootcampId) {
    console.log("Calculating Average Cost....".blue.inverse);

    // aggregation here and match and group are pipeline of it
    const obj = await this.aggregate([{
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: "$bootcamp",
                averageCost: { $avg: "$tuition" }
            }
        }
    ]);

    // saving here
    try {
        await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(obj[0].averageCost / 10) * 10
        });
    } catch (e) {
        console.log(e);
    }
};

// call getAverageCost after save
courseSchema.post("save", function() {
    // static method thats why calling in direct on constructor (PARENT)

    this.constructor.getAverageCost(this.bootcamp);
});

// call getAverageCost before remove
courseSchema.pre("remove", function() {
    this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model("Course", courseSchema);