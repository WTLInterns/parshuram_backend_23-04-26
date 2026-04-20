const User = require('../models/User');
const jwt = require('jsonwebtoken');
var bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const DeliveryBoy = require("../models/DeliveryBoy")
// for signup
const registerUser = async (req, res) => {
    try {
      const { name, email, password, phone, street, city, state, zipcode,role} = req.body;
  
      // Validate required fields
      if (!name || !email || !password || !phone || !street || !city || !state || !zipcode) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Create and save a new user
      const newUser = new User({
        name,
        email,
        password,
        phone,
        street,
        city,
        state,
        zipcode,
        role
      });
  
      await newUser.save();
  
      res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
      res.status(500).json({ message: 'Error registering user', error: error.message });
    }
  };
  
  
  
  const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }
  
      let user = await User.findOne({ email });
      let role = 'user';
  
      if (!user) {
        user = await DeliveryBoy.findOne({ email });
        if (user) {
          role = 'DeliveryBoy';
        }
      } else {
        role = user.role || 'user';
      }
  
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
  
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
  
      const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: '20d' });
  
      const redirectMap = {
        user: '/home',
        DeliveryBoy: '/deliveryDashboard',
      };
  
      const redirectPath = redirectMap[role] || '/home';
  
      return res.status(200).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role,
        },
        redirect: redirectPath,
      });
  
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
  };



  

  // Get user profile

//   const loginUser = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({ message: 'Email and password are required.' });
//         }

//         // 🔹 Find both User and DeliveryBoy in parallel
//         const user = await User.findOne({ email });
//         console.log("admin role",user.role)
//         const deliveryBoy = await DeliveryBoy.findOne({ email });

//         let authUser = user || deliveryBoy;
//         let role = user ? 'user' : (deliveryBoy ? 'DeliveryBoy' : null);

//         if (!authUser) {
//             return res.status(401).json({ message: 'Invalid email or password (User not found).' });
//         }

//         console.log("Stored Password:", authUser.password); // Debugging: Check stored password
//         console.log("Entered Password:", password); // Debugging: Check entered password

//         // 🔹 Compare password
//         const isPasswordValid = await bcrypt.compare(password, authUser.password);
//         console.log("Password Valid:", isPasswordValid); // Debugging: Check password match

//         if (!isPasswordValid) {
//             return res.status(401).json({ message: 'Invalid email or password (Wrong password).' });
//         }

//         // 🔹 Generate token
//         const token = jwt.sign({ id: authUser._id, role }, process.env.JWT_SECRET, { expiresIn: '20d' });

//         return res.status(200).json({
//             token,
//             user: {
//                 id: authUser._id,
//                 name: authUser.name,
//                 email: authUser.email,
//                 role,
//             },
//             redirect: role === "DeliveryBoy" ? "/deliveryDashboard" : "/home",
//         });

//     } catch (error) {
//         console.error('Login error:', error);
//         return res.status(500).json({ message: 'Internal server error.', error: error.message });
//     }
// };



// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: 'Email and password are required.' });
//     }

//     // 🔹 Find the User
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(401).json({ message: 'Invalid email or password (User not found).' });
//     }

//     console.log("Stored Password:", user.password); // Debugging: Check stored password
//     console.log("Entered Password:", password); // Debugging: Check entered password

//     // 🔹 Compare password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     console.log("Password Valid:", isPasswordValid); // Debugging: Check password match

//     if (!isPasswordValid) {
//       return res.status(401).json({ message: 'Invalid email or password (Wrong password).' });
//     }

//     // 🔹 Generate token
//     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '20d' });

//     return res.status(200).json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role, // Use the role directly from the user
//       },
//       redirect: user.role === "DeliveryBoy" ? "/deliveryDashboard" : "/home",
//     });

//   } catch (error) {
//     console.error('Login error:', error);
//     return res.status(500).json({ message: 'Internal server error.', error: error.message });
//   }
// };


  const getUserProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password'); // Exclude password from response
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user profile', error: error.message });
    }
  };
  
  // Update user profile
  const updateUserProfile = async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const user = await User.findById(req.user.id);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update user fields if provided
      user.name = name || user.name;
      user.email = email || user.email;
      if (password) {
        user.password = password;
      }
  
      await user.save();
  
      res.status(200).json({ message: 'User profile updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
  };

  //  email config

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user:process.env.EMAIL_USER,
      pass:process.env.EMAIL_PASS
    }
  })

  // forget password
  const resetPassword = async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(401).json({ message: 'Email is required' });
    }
  
    console.log('Received email:', email); // Log email to console
  
    try {
      const userFind = await User.findOne({ email: email });
  
      // token generate for reset password
      const token = jwt.sign({ _id: userFind._id }, process.env.JWT_SECRET, {
        expiresIn: "2m"
      })
  
      const setusertoken = await User.findByIdAndUpdate({ _id: userFind._id }, { verifyToken: token }, { new: true });
  
      if (setusertoken) {
        const mailOptions = {
          from: "gfullstackwtl@gmail.com",
          to: email,
          subject: "Password Reset Request",
          text: `Click on this link to reset your password: http://localhost:3000/forgotPassword/${userFind.id}/${setusertoken.verifyToken}`
        }
  console.log("userid...",userFind.id,"setusertoken",setusertoken.verifyToken);
  
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("error", error);
            res.status(401).json({ status: 401, message: "email not send" });
          } else {
            console.log("Email sent", info.response);
            res.status(201).json({ status: 201, message: "Email sent Successfully" });
          }
        })
      }
  
    } catch (error) {
      res.status(401).json({ status: 401, message: "invalid user" });
  
    }
  }

  
  // verify user for forgot password time
  
  const forgotPassword = async (req, res) => {
    const { id, token } = req.params;
  
    try {
      const validUser = await User.findOne({ _id: id, verifyToken: token })
      const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
      console.log(verifyToken);
      if (validUser && verifyToken._id) {
        res.status(201).json({ status: 201, validUser })
      } else {
        res.status(401).json({ status: 401, message: "user not exist" })
      }
    } catch (error) {
      res.status(401).json({ status: 401, error })
    }
  }
  
  // change password
  
  const changePassword = async (req, res) => {
    const { id, token } = req.params;
  
    const { password } = req.body;
    try {
      const validUser = await User.findOne({ _id: id, verifyToken: token })
      const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
  
      if (validUser && verifyToken._id) {
        const newPassword = await bcrypt.hash(password,12);
  
        const setNewPass = await User.findByIdAndUpdate({_id:id},{password:newPassword});
  
        setNewPass.save();
        res.status(201).json({status:201,setNewPass})
  
      } else {
        res.status(401).json({ status: 401, message: "user not exist" })
      }
  
    } catch (error) {
      res.status(401).json({ status: 401, error })
    }
  }


  const userResetPassword = async (req, res) => {
    const { email } = req.body;
    console.log("Hii you are in email",email)
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
  
    console.log('Received email:', email);
  
    try {
      const userFind = await User.findOne({ email });
  
      if (!userFind) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000);
  
      // Set expiry time for 1 minute from now
      const expiry = Date.now() + 60 * 1000;
  
      // Update user with OTP and expiry
      userFind.resetOTP = otp;
      userFind.resetOTPExpiry = expiry;
      console.log("otp",userFind.resetOTP)
      await userFind.save();
  
      const mailOptions = {
        from: "gfullstackwtl@gmail.com",
        to: email,
        subject: "Password Reset OTP",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f9f9f9;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #fff;
                border-radius: 5px;
                overflow: hidden;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
              }
              .header {
                background-color: #ffffff;
                padding: 20px;
                text-align: center;
                border-bottom: 2px solid #22c55e;
              }
              .header h1 {
                color: #22c55e;
                margin: 0;
                font-size: 24px;
              }
              .subheader {
                text-align: center;
                color: #666;
                font-size: 14px;
                margin-top: 5px;
              }
              .content {
                padding: 20px;
              }
              .otp-box {
                background-color: #f5f5f5;
                border-radius: 5px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
              }
              .otp-code {
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 5px;
                color: #22c55e;
              }
              .details {
                margin: 20px 0;
                font-size: 14px;
              }
              .footer {
                background-color: #f5f9ff;
                padding: 15px;
                text-align: center;
                font-size: 12px;
                color: #666;
              }
              .note {
                font-size: 12px;
                color: #777;
                text-align: center;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Parshuram Dairy</h1>
                <div class="subheader">Password Reset Request</div>
              </div>
              
              <div class="content">
                <p>Hello,</p>
                <p>We received a request to reset your password. Please use the OTP below to complete your password reset.</p>
                
                <div class="otp-box">
                  <div>Your One-Time Password (OTP)</div>
                  <div class="otp-code">${otp}</div>
                </div>
                
                <div class="details">
                  <p><strong>OTP Details:</strong></p>
                  <p>• <strong>Expires in:</strong> 2 minutes</p>
                  <p>• <strong>Email:</strong> ${email}</p>
                </div>
                
                <p>If you did not request a password reset, please ignore this email or contact our support team.</p>
              </div>
              
              <div class="footer">
                <p>Thank you for using <strong>Parshuram Dairy</strong>!</p>
                <p>© ${new Date().getFullYear()} Parshuram Dairy. All rights reserved.</p>
              </div>
              
              <div class="note">
                This is an automated email, please do not reply to this message.
              </div>
            </div>
          </body>
          </html>
        `
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending mail:", error);
          return res.status(500).json({ message: "Failed to send OTP" });
        } else {
          console.log("OTP Email sent:", info.response);
          return res.status(200).json({ message: "OTP sent successfully" });
        }
      });
  
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
  
  const verifyOTP = async (req, res) => {
    const { email, otp } = req.body
  


    console.log("email OTP",email)
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" })
    }
  
    try {
      const user = await User.findOne({ email })

      console.log("user",user)
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }
  
      console.log("Stored OTP:", user.resetOTP);  
      // or user.otp for the updated schema
    console.log("Received OTP:", otp);
      // Check if OTP matches and is not expired

      if (user.resetOTP !== otp) {
        return res.status(400).json({ message: "Invalid OTP" })
      }
  
      if (new Date() > new Date(user.resetOTPExpiry)) {
        return res.status(400).json({ message: "OTP has expired. Please request a new one." })
      }


      user.isOTPVerified = true;
      await user.save();
      // OTP is valid, allow user to reset password
      return res.status(200).json({ message: "OTP verified successfully" })
    } catch (error) {
      console.error("Error in verifyOTP:", error)
      return res.status(500).json({ message: "Internal Server Error" })
    }
  }

  
  const updatePassword = async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;
  
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Email, new password, and confirm password are required" });
    }
  
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log("OTP is Verified",user.isOTPVerified)
  
      if (!user.isOTPVerified) {
        return res.status(403).json({ message: "OTP not verified" });
      }
  
      // Update password (no need to hash manually because the pre-save hook will handle it)
      user.password = newPassword;
  
      // Clear OTP and flags
      user.resetOTP = undefined;
      user.resetOTPExpiry = undefined;
      user.isOTPVerified = false;
  
      await user.save(); // pre-save hook will automatically hash the password before saving
  
      return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
  


  // user profile details fetch
const getUserProfileDetail = async (req, res) => {
    try {
      const userProfile = await User.findById(req.user.id); // Find user by _id
  
      console.log(req.user.id)
  
      if (!userProfile) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json(userProfile);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // update user profile details
const updateUserProfileDetail = async (req, res) => {
    try {
      const userId = req.user.id; // Extract user ID from request
      const updates = req.body; // Get fields to update from request body
  
      // Find and update user by _id
      const updatedUser = await User.findByIdAndUpdate(userId, updates, {
        new: true, // Return updated document
        runValidators: true, // Ensure validation rules apply
      });
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({ message: "Profile updated successfully", updatedUser });
    } catch (error) {
      res.status(500).json({ message: "Error updating profile", error: error.message });
    }
  };

  module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile, changePassword, resetPassword, forgotPassword, getUserProfileDetail, updateUserProfileDetail, userResetPassword, verifyOTP, updatePassword   };
