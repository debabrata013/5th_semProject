const express=require('express')
const app=express()
const path=require('path')
const UserRoutes=require('./routes/user')
const multer = require('multer');

const bodyParser = require('body-parser');
const mongoose=require("mongoose")
const cookieParser=require('cookie-parser')
const { checkForAuthenticationCookie } = require('./middlewares/authenticate')
const { log } = require('console')
const port=8000

app.set("view engine","ejs")
app.set("views",path.resolve('./views'))

app.use(express.urlencoded({extended:false}))
app.use(express.static('public'))
app.use(cookieParser())
app.use(checkForAuthenticationCookie("token"))
// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect("mongodb://127.0.0.1:27017/parking").then(()=>{
    console.log('connected to db');
}).catch((e)=>{
    console.error("no connect"+e);
})
// Define a schema and model for your data
const statisticsSchema = new mongoose.Schema({
    month: String,
    revenue: Number,
    userRole: String,
    taskStatus: String,
});

const Statistic = mongoose.model('Statistic', statisticsSchema);

// API route to get statistics data
app.get('/api/statistics', async (req, res) => {
    try {
        const data = await Statistic.find({});
        res.json(data);
    } catch (error) {
        res.status(500).send('Error fetching data');
    }
});

    app.get('/',async(req,res)=>{
        
    
        res.render('home',{
            user:req.user,
          
        })
        })


// Booking schema and model
const bookingSchema = new mongoose.Schema({
    bookingId: String,
    userName: String,
    parkingSpot: String,
    startTime: Date,
    endTime: Date,
    status: { type: String, enum: ['Pending', 'Confirmed', 'Canceled'], default: 'Pending' }
});

const Booking = mongoose.model('Booking', bookingSchema);

// Route to get bookings
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.json(bookings);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// Route to confirm booking
app.post('/api/bookings/:id/confirm', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (booking) {
            booking.status = 'Confirmed';
            await booking.save();
            res.status(200).send('Booking confirmed');
        } else {
            res.status(404).send('Booking not found');
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// Route to cancel booking
app.post('/api/bookings/:id/cancel', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (booking) {
            booking.status = 'Canceled';
            await booking.save();
            res.status(200).send('Booking canceled');
        } else {
            res.status(404).send('Booking not found');
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
});
// Sample user data
const users = [
    { userId: '001', name: 'John Doe', email: 'john@example.com', status: 'Active', isVIP: true },
    { userId: '002', name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive', isVIP: false },
    { userId: '003', name: 'Emily Johnson', email: 'emily@example.com', status: 'Active', isVIP: false },
    { userId: '004', name: 'Michael Brown', email: 'michael@example.com', status: 'Active', isVIP: true },
    { userId: '005', name: 'Olivia Davis', email: 'olivia@example.com', status: 'Inactive', isVIP: false }
];

// Route to get users
app.get('/api/users', (req, res) => {
    res.json(users);
});
let paymentRequests = [
    { id: 1, userName: 'John Doe', email: 'john@example.com', coins: 10, transactionId: 'TXN123456' },
    { id: 2, userName: 'Jane Smith', email: 'jane@example.com', coins: 20, transactionId: 'TXN123457' },
    { id: 3, userName: 'Emily Johnson', email: 'emily@example.com', coins: 5, transactionId: 'TXN123458' },
];

// API to get payment requests
app.get('/api/payment-requests', (req, res) => {
    res.json(paymentRequests);
});
const paymentSchema = new mongoose.Schema({
    transactionID: String,
    amountPaid: Number,
    email: String,
    screenshotPath: String,
    timestamp: { type: Date, default: Date.now }
});

// Create a model from the schema
const Payment = mongoose.model('Payment', paymentSchema);


// API to handle payment request actions (success/reject)
app.post('/api/payment-requests/:id', (req, res) => {
    const { id } = req.params;
    const { action } = req.body;

    const requestIndex = paymentRequests.findIndex(req => req.id === parseInt(id));

    if (requestIndex !== -1) {
        if (action === 'success') {
            console.log(`Transaction ${paymentRequests[requestIndex].transactionId} marked as success.`);
            // Update the user's balance in the database here
        } else if (action === 'reject') {
            console.log(`Transaction ${paymentRequests[requestIndex].transactionId} rejected.`);
            // Handle the rejection case here
        }

        // Remove the request from the list after processing
        paymentRequests.splice(requestIndex, 1);

        res.status(200).send('Request processed successfully');
    } else {
        res.status(404).send('Request not found');
    }
});

// Set up Multer storage for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/public/uploads/'); // Directory where screenshots will be saved
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Save file with a timestamp
    }
});

const upload = multer({ storage: storage });

// Route to handle form submission
app.post('/submit-payment', upload.single('paymentScreenshot'), (req, res) => {
    const { transactionID, amountPaid, email } = req.body;

    // Ensure file upload was successful
    if (!req.file) {
        return res.status(400).json({ error: 'Payment screenshot is required!' });
    }

    // Create a new Payment document
    const payment = new Payment({
        transactionID,
        amountPaid,
        email,
        screenshotPath: req.file.path,
    });

    // Save the payment details to MongoDB
    payment.save()
        .then(() => {
            res.status(200).json({ message: 'Payment submitted successfully!' });
        })
        .catch(err => {
            console.error('Error saving payment details:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

// Serve the uploads folder publicly (so you can view the uploaded images)
app.use('/uploads', express.static('uploads'));

// Start the server

app.use('/user',UserRoutes)


app.listen(port,()=>console.log(`server lissing at http://localhost:${port}`))