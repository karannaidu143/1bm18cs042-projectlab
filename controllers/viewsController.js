const Tour = require('./../modules/tour_Model')
const User = require('./../modules/userModel')
const booking = require('./../modules/bookingModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('../utils/appError')

exports.getOverview = catchAsync(async (req, res, next) => {
    // 1)get tour data  from collection  
    const tours = await Tour.find();

    //2)Build template
    //3) render that templpate using tour data from 1)


    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
})
exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({
        slug: req.params.slug
    }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });
    if (!tour) {
        return next(new AppError('there is no tour with that name ', 404))
    }
    res.status(200).render('_tour', {
        title: `${tour.name} Tour`,
        tour

    })
});
exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account '
    })

}
exports.getSignupForm = (req, res) => {
    res.status(200).render('signup', {
        title: 'Create  your account! '
    })

}

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: ' your account '
    })
}
exports.getMyTours = catchAsync(async (req, res, next) => {
    //1)find all booking
    const bookings = await booking.find({ user: req.user.id })
    //2)Find tours with returned Ids
    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });//finds all the tours which have an id which is in the array tourIDs
    res.status(200).render('overview', {
        title: 'My tours',
        tours
    })
})
exports.updateUserdata = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {


        name: req.body.name,
        email: req.body.email
    }, {
        new: true,
        runValidators: true
    });
    res.status(200).render('account', {
        title: ' your account ',
        user: updatedUser
    })
});