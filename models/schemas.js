const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ITS_ID
// "50431232"
// TanzeemFile_No
// ""
// Full_Name
// "Husain bhai Mohammed bhai Badwah wLaBadwah wala"
// Age
// "24"
// Gender
// "Male"
// Misaq
// "Done"
// Mobile
// "917415881359"
// NOC
// false
// Allocated
// false

let user = new Schema({
    ITS_ID: {
        type: String,
        required: true,
    },
    TanzeemFile_No: {
        type: String,
        required: true,
    },
    Age: {
        type: String,
        default:"not known",
    },
    Gender: {
        type: String,
        default: "Male",
    },
    Misaq: {
        type: String,
        required: true,
    },

    Full_Name: {
        type: String,
        required: true,
    },
    Sabeel: {
        type: String,
    },
    Mobile: {
        type: String,
        required: true
    },
    NOC: {
        type: Boolean,
        default: false
    },
    Allocated: {
        type: Boolean,
        default: false
    }
});



let allocation = new Schema({
    its_id: {
        type: String,
        required: true,
    },
    serial: {
        type: Number,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
});

let event = new Schema({
    event: {
        type: String,
        required: true
    },

    serial: {
        type: Number,
        required: true,
    },
    available: {
        type: Boolean,
        default: false
    },
})

let users = mongoose.model("user", user, 'user');
let allocations = mongoose.model("allocation", allocation, 'allocation');
let events = mongoose.model("event", event, 'event');

let mySchemas = {
    'users': users,
    "allocation": allocations,
    "events": events,
}

module.exports = mySchemas;