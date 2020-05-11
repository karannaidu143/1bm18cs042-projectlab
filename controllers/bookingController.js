const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Tour = require('../modules/tour_Model');
const Booking = require('../modules/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');


exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    //1) get currently booked tour
    const tour = await Tour.findById(req.params.tourId)
    //2) create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourID,
        line_items: [
            {
                name: `${tour.name}TOUR`,
                description: tour.summary,
                images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                amount: tour.price * 100,
                currency: 'INR',
                quantity: 1
            }
        ]


    })
    //3)create session as response
    res.status(200).json({
        status: 'success',
        session
    })
});
exports.createBookingCheckout = catchAsync(async (req, res, next) => {

    // Thiis is temoporary ,because it's unsecure :everyone can make bookings without paying 
    const { tour, user, price } = req.query;
    if (!tour && !user && !price) return next();
    await Booking.create({ tour, user, price })
    res.redirect(req.originalUrl.split('?')[0]);// original url is the entire url from which the request came 
})