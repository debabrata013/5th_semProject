const express=require('express')
const app=express()
const path=require('path')
const UserRoutes=require('./routes/user')
const multer = require('multer');
const Booking = require('./models/Booking');
const bodyParser = require('body-parser');
const mongoose=require("mongoose")
const cookieParser=require('cookie-parser')
const { checkForAuthenticationCookie } = require('./middlewares/authenticate')
const { log } = require('console')
const port=8000
const Contact = require('./models/Contact')

app.set("view engine","ejs")
app.set("views",path.resolve('./views'))

app.use(express.urlencoded({extended:false}))
app.use(express.static('public'))
app.use(cookieParser())
app.use(checkForAuthenticationCookie("token"))




const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use your email provider
    auth: {
        user: `pattnaikd833@gmail.com`, // Your email address
        pass: `pmsdmvcqrcqhziif`, // Your email password or app password
    },
});

// Function to send confirmation email
async function sendConfirmationEmail(userEmail, bookingDetails) {
    const mailOptions = {
        from: `pattnaikd833@gmail.com`,
        to: userEmail,
        subject: 'Booking Confirmation',
        text: `Your booking has been confirmed!\n\nDetails:\n${JSON.stringify(bookingDetails, null, 2)}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent to:', userEmail);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

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
const User = require('./models/user');
// API route to get statistics data
// app.get('/api/statistics', async (req, res) => {
//     try {
//         // const totalUsers = await User.countDocuments();
//         // const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
//         // const canceledBookings = await Booking.countDocuments({ status: 'Canceled' });
//         // const confirmedBookings = await Booking.countDocuments({ status: 'Confirmed' }); // Fetch confirmed bookings

//         // // Assuming each confirmed booking generates a fixed revenue of 50
//         // const revenue = confirmedBookings * 50;

//         // console.log(pendingBookings);
//         // console.log(totalUsers);
//         const totalUsers = await User.countDocuments();
//         const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
//         const canceledBookings = await Booking.countDocuments({ status: 'Canceled' });
        
//         // Aggregate to sum the totalAmount of confirmed bookings
//         const revenueData = await Booking.aggregate([
//             { $match: { status: 'Confirmed' } },
//             { $group: { _id: null, totalRevenue: { $sum: '$totalCost' } } }
//         ]);

//         // Get the total revenue, defaulting to 0 if there are no confirmed bookings
//         const revenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        
//         res.json({
//             totalUsers,
//             revenue,
//             tasks: pendingBookings,
//             issues: canceledBookings
//         });
//     } catch (error) {
//         console.error(error); // Log the error for debugging
//         res.status(500).send('Error fetching data');
//     }
// });
app.get('/api/statistics', async (req, res) => {
    try {
        // Get total users
        const totalUsers = await User.countDocuments();
        
        // Get counts for pending and canceled bookings
        const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
        const canceledBookings = await Booking.countDocuments({ status: 'Canceled' });
        
        // Aggregate to get total revenue from confirmed bookings
        const revenueData = await Booking.aggregate([
            { $match: { status: 'Confirmed' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalCost' } } }
        ]);
        
        // Get total revenue, defaulting to 0 if no confirmed bookings
        const revenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        // Get monthly revenue data
        const monthlyRevenue = await Booking.aggregate([
            { $match: { status: 'Confirmed' } },
            { $group: {
                _id: { $month: '$startDate' },
                totalRevenue: { $sum: '$totalCost' }
            }},
            { $sort: { _id: 1 } } // Sort by month
        ]);

        // Get canceled bookings distribution
        const canceledDistribution = await Booking.aggregate([
            { $match: { status: 'Canceled' } },
            { $group: {
                _id: { $month: '$startDate' },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } } // Sort by month
        ]);

        // Prepare data for response
        const confirmedCount = await Booking.countDocuments({ status: 'Confirmed' });

        res.json({
            totalUsers,
            revenue,
            tasks: pendingBookings,
            issues: canceledBookings,
            monthlyRevenue, // This will be used for the line chart
            canceledDistribution, // This will be used for the bar chart
            confirmed: confirmedCount, // For the pie chart
            canceled: canceledBookings // For the pie chart
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).send('Error fetching data');
    }
});


    app.get('/',async(req,res)=>{
        
    
        res.render('home',{
            user:req.user,
          
        })
        })


// Route to display contact submissions in the admin section
app.get('/admin/contacts', async (req, res) => {
    try {
      const contacts = await Contact.find(); // Retrieve all contacts from MongoDB
      res.render('adminContacts', { contacts }); // Assuming you're using EJS for rendering
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  });






app.get('/booking', (req, res) => {
    res.render('booking')
});
app.post('/book', async (req, res) => {
    const { startDate, duration, location, name, email, phone } = req.body;

    try {
        // Create a new booking
        const newBooking = new Booking({
            startDate,
            duration,
            location,
            name,
            email,
            phone,
            totalCost: duration * 50, // Assume cost is $50/hour
            status: 'Pending'
        });

        // Save booking to DB
        await newBooking.save();

        // Respond with success message
        res.status(200).json({ message: 'Booking successful' });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ message: 'Failed to book slot' });
    }
});
// Fetch all bookings (Admin View)
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find({ status: 'Pending' }); // Fetch only bookings with status 'Pending'
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error });
    }
});


// Update booking status (Admin Action)
app.put('/book/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const bookingId = req.params.id;

        // Find the booking and update the status
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { status },
            { new: true }
        );

        if (!updatedBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json({ message: 'Booking status updated', booking: updatedBooking });
    } catch (error) {
        res.status(500).json({ message: 'Error updating booking status', error });
    }
});


app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find(); 
        
        // Fetch all users
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching users' });
    }
});


app.post('/submit-form', async (req, res) => {
    try {
      const { name, email, message } = req.body;
      
      const newContact = new Contact({
        name,
        email,
        message
      });
  
      await newContact.save(); // Save the contact to MongoDB
      
      res.status(200).send('Form submitted successfully!');
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
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
app.get('/api/canceled-distribution', async (req, res) => {
    try {
        const canceledDistribution = await Booking.aggregate([
            { $match: { status: 'Canceled' } },
            { $group: {
                _id: { $month: '$startDate' },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);

        res.json(canceledDistribution);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching canceled booking distribution');
    }
});
app.get('/api/monthly-data', async (req, res) => {
    try {
        const monthlyRevenue = await Booking.aggregate([
            { $match: { status: 'Confirmed' } },
            { $group: {
                _id: { $month: '$startDate' },
                totalRevenue: { $sum: '$totalCost' }
            }},
            { $sort: { _id: 1 } }
        ]);

        res.json(monthlyRevenue);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching monthly data');
    }
});



app.listen(port,()=>console.log(`server lissing at http://localhost:${port}`))