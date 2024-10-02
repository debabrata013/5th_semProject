const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    startDate: {
        type: Date,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    totalCost: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        default: 'Pending', // Default status is 'Pending'
        enum: ['Pending', 'Confirmed', 'Canceled'], // Possible statuses
    }
});

module.exports = mongoose.model('Booking', bookingSchema);