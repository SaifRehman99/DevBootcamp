// function inside a function
// a generic middleware for all routes
const advanceQuery = (model, populate) => async(req, res, next) => {
    // copy the req query here
    const reqQuery = {...req.query };

    // fields to exclude
    const removeFields = ["select", "sort", "limit", "page"];

    // loop over removeFields and delete from reqQuery to get the data of select and sort
    removeFields.forEach(params => delete reqQuery[params]);

    // stringify the query
    let queryStr = JSON.stringify(reqQuery);

    // replacing the query with $sgn
    queryStr = queryStr.replace(
        /\b(gt|gte|lt|lte|in|eq|ne|nin)\b/g,
        match => `$${match}`
    );

    let bootcamper = model.find(JSON.parse(queryStr));

    // select Fields
    if (req.query.select) {
        const fields = req.query.select.split(",").join(" ");
        bootcamper = bootcamper.select(fields);
    }

    // sorting here
    if (req.query.sort) {
        const sortBY = req.query.sort.split(",").join(" ");
        bootcamper = bootcamper.sort(sortBY);
    }

    // pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 2;
    const start = (page - 1) * limit;
    const end = page * limit;
    const total = await model.countDocuments();

    bootcamper = bootcamper.skip(start).limit(limit);

    if (populate) {
        bootcamper = bootcamper.populate(populate);
    }

    const data = await bootcamper;

    // pagination
    const pagination = {};

    if (end < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (start > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    // sending the response here
    res.advanceQuery = {
        success: true,
        pagination,
        count: data.length,
        data
    };

    next();
};

module.exports = advanceQuery;