var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require("dotenv").config();
var connectDB = require("./config/db"); // ✅ Import connectDB
const cors = require('cors')
const deliveryManagementRoutes = require("./routes/deliveryManagementRoutes")
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const userRoutes = require("./routes/userRoutes")
// const productRoutes = require("./routes/productRoutes")
const cartRoutes = require("./routes/cartRoutes")

const orderRoutes = require("./routes/orderRoutes")
const issueRoutes = require("./routes/issueRoutes") // New import for issues
const reviewRoutes = require("./routes/reviewRoutes")

const resetPasswordRoutes = require("./routes/userRoutes")
const forgotPasswordRoutes = require("./routes/userRoutes")
const changePasswordRoutes = require("./routes/userRoutes")

const updatePaymentStatus = require("./routes/orderRoutes")
const updateOrderStatus = require("./routes/orderRoutes")

const manageAdmin = require("./routes/adminManagerRoutes")

// const uploadRoutes = require("./controllers/routeUpload")
const stockRoutes = require("./routes/stockRoutes");
const uploadImage = require("./routes/uploadRoute")
const deliveryRoutes = require("./routes/deliveryRoutes") // New import for delivery routes
var deliveryDashboardRouter = require('./routes/deliveryDashboardRoutes');

var app = express();

// ✅ Connect to Database
connectDB();

app.use(express.static('public'));





// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use("/api/users", userRoutes)
// app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/orders", orderRoutes)
// app.use("/api/upload", uploadRoutes)
app.use("/api/issues", issueRoutes) // New route for issues
app.use('/api/review',reviewRoutes)

app.use("/api/reset-password", resetPasswordRoutes)
app.use("/api/forgot-password", forgotPasswordRoutes)
app.use("/api/change-password", changePasswordRoutes)

app.use("/api/updateOrderStatus", updateOrderStatus)
app.use("/api/updatePayment", updatePaymentStatus)

app.use('/api/userProfileDetail', userRoutes)
app.use('/api/updateUserProfileDetail', userRoutes)
app.use('/api/admin-manage', manageAdmin)
app.use("/api/stocks", stockRoutes);
app.use("/api/upload", uploadImage);
app.use("/api/delivery", deliveryRoutes); // Add the new delivery routes
app.use('/api/delivery-dashboard', deliveryDashboardRouter);
app.use("/api/deliver-management",deliveryManagementRoutes)
// catch 404 and forward to error handler


app.use(express.json())

// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

// Start the server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = app;

