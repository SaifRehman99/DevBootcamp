const NodeGeocoder = require("node-geocoder");

const options = {
    provider: process.env.PROVIDER,

    // Optional depending on the providers
    httpAdapter: "https", // Default
    apiKey: process.env.MAPQUEST_API, // for Mapquest, OpenCage, Google Premier
    formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;