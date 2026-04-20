// const nodemailer = require("nodemailer");

// /**
//  * Sends order confirmation email to customer with delivery boy details
//  * The same format will be used for admin notifications
//  */
// const sendOrderConfirmationEmail = async (
//   email,
//   items,
//   totalAmount,
//   address,
//   orderId,
//   deliveryBoy = null, // Optional parameter for delivery boy details
//   isAdmin = false // Flag to indicate if this is for admin
// ) => {
//   try {
//     // Create a transporter using SMTP
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//       tls: {
//         rejectUnauthorized: false
//       },
//       secure: true
//     });

//     // Determine email subject based on recipient and delivery status
//     let emailSubject;
//     if (isAdmin) {
//       emailSubject = deliveryBoy 
//         ? `[ADMIN] Parshuram Dairy - Order #${orderId.toString().slice(-6)} Assigned to ${deliveryBoy.name}`
//         : `[ADMIN] Parshuram Dairy - New Order #${orderId.toString().slice(-6)}`;
//     } else {
//       emailSubject = deliveryBoy 
//         ? "Parshuram Dairy - Your Order is Out for Delivery!" 
//         : "Parshuram Dairy - Order Confirmation";
//     }

//     // Format the items for display in the email
//     const itemsHtml = items
//       .map(
//         (item) => `
//           <tr>
//             <td style="border: 1px solid #ddd; padding: 10px;">
//               ${item.name || 'Product'}
//             </td>
//             <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">
//               ${item.quantity} ${item.unit || ''}
//             </td>
//             <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">
//               Rs.${(item.price || 0).toFixed(2)}
//             </td>
//             <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">
//               Rs.${((item.quantity * (item.price || 0)) || 0).toFixed(2)}
//             </td>
//           </tr>
//         `
//       )
//       .join("");

//     // Create delivery boy section if available
//     const deliveryBoySection = deliveryBoy 
//       ? `
//         <div style="margin-top: 20px; padding: 15px; background-color: #e3f2fd; border-radius: 5px; border-left: 4px solid #2196F3;">
//           <h4 style="margin-top: 0; color: #2196F3;">🚚 Delivery Partner Details:</h4>
//           <p style="margin-bottom: 5px;"><strong>Name:</strong> ${deliveryBoy.name || 'Not assigned yet'}</p>
//           ${deliveryBoy.phone ? `<p style="margin-bottom: 5px;"><strong>Contact:</strong> ${deliveryBoy.phone}</p>` : ''}
//           ${deliveryBoy.email ? `<p style="margin-bottom: 5px;"><strong>Email:</strong> ${deliveryBoy.email}</p>` : ''}
//           <p style="margin-bottom: 0; font-style: italic; color: #666;">Your order will be delivered by the assigned delivery partner. ${!isAdmin ? 'You can contact them directly for any delivery-related queries.' : ''}</p>
//         </div>
//       ` 
//       : `
//         <div style="margin-top: 20px; padding: 15px; background-color: #fff4e5; border-radius: 5px; border-left: 4px solid #ff9800;">
//           <h4 style="margin-top: 0; color: #ff9800;">🚚 Delivery Information:</h4>
//           <p style="margin-bottom: 0;">A delivery partner will be assigned to your order soon. ${!isAdmin ? "You'll receive an update when your order is out for delivery." : "Please assign a delivery partner from the admin dashboard."}</p>
//         </div>
//       `;

//     // Admin-specific note section
//     const adminNoteSection = isAdmin 
//       ? `
//         <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px; border-left: 4px solid #607d8b;">
//           <h4 style="margin-top: 0; color: #607d8b;">⚙️ Admin Actions:</h4>
//           <p style="margin-bottom: 0;">This is an admin notification copy of the customer's order confirmation. ${!deliveryBoy ? 'Please assign a delivery partner to this order.' : 'A delivery partner has been assigned to this order.'}</p>
//         </div>
//       `
//       : '';

//     // Compose the email HTML content
//     const htmlContent = `
//       <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
//         <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #28a745;">
//           <h1 style="color: #28a745; margin: 0;">Parshuram Dairy</h1>
//           <p style="margin-top: 5px; font-size: 16px;">${isAdmin ? 'New Order Notification' : 'Thank you for your order!'}</p>
//         </div>
        
//         <div style="padding: 20px;">
//           <p>Hello${isAdmin ? ' Admin' : ''},</p>
//           <p>${isAdmin 
//               ? 'A new order has been placed. Here are the order details:' 
//               : (deliveryBoy 
//                   ? 'Great news! Your order is now out for delivery with our delivery partner.' 
//                   : 'Your order has been successfully placed. Here are your order details:')
//             }</p>

//           <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
//             <h3 style="color: #16a085; margin-top: 0;">🛒 Order Details:</h3>
//             ${orderId ? `<p><strong>Order ID:</strong> #${orderId.toString().slice(-6)}</p>` : ''}
//             <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
//             <p><strong>Payment Method:</strong> ${address.paymentMethod || 'Not specified'}</p>
//           </div>

//           <h3 style="color: #16a085;">📦 Ordered Items:</h3>
//           <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
//             <thead>
//               <tr style="background-color: #f8f9fa;">
//                 <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Product</th>
//                 <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Quantity</th>
//                 <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Price</th>
//                 <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Subtotal</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${itemsHtml}
//               <tr style="background-color: #f8f9fa; font-weight: bold;">
//                 <td colspan="3" style="border: 1px solid #ddd; padding: 10px; text-align: right;">Total Amount:</td>
//                 <td style="border: 1px solid #ddd; padding: 10px; text-align: right; color: #28a745;">Rs.${totalAmount.toFixed(2)}</td>
//               </tr>
//             </tbody>
//           </table>

//           <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
//             <h4 style="margin-top: 0; color: #007bff;">📍 Delivery Address:</h4>
//             <p style="margin-bottom: 5px;">${address.street || ''}</p>
//             <p style="margin-bottom: 5px;">${address.landmark || ''}</p>
//             <p style="margin-bottom: 5px;">${address.city || ''} ${address.zipcode || ''}</p>
//             <p style="margin-bottom: 5px;">${address.state || ''}, ${address.country || ''}</p>
//             <p style="margin-bottom: 0;">Phone: ${address.phone || 'Not provided'}</p>
//           </div>
          
//           ${deliveryBoySection}
          
//           ${adminNoteSection}
          
//           <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
//             <p>If you have any questions about this order, please contact our customer support at <a href="mailto:support@parshuramdairy.com" style="color: #007bff;">support@parshuramdairy.com</a> or call us at +91-9172474779.</p>
//             <p>${isAdmin ? 'Thank you for your attention to this order.' : 'Thank you for choosing Parshuram Dairy!'}</p>
//           </div>
//         </div>
        
//         <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d; border-top: 1px solid #eee;">
//           <p>&copy; ${new Date().getFullYear()} Parshuram Dairy. All rights reserved.</p>
//           <p>This is an automated email, please do not reply to this message.</p>
//         </div>
//       </div>
//     `;

//     // Email options
//     const mailOptions = {
//       from: {
//         name: "Parshuram Dairy",
//         address: process.env.EMAIL_USER
//       },
//       to: email,
//       subject: emailSubject,
//       html: htmlContent
//     };

//     // Send the email
//     const info = await transporter.sendMail(mailOptions);
//     console.log(`Email sent to ${email}. Message ID: ${info.messageId}`);
//     return info;
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw error;
//   }
// };

// /**
//  * Sends order confirmation email to customer and a copy to admin
//  */
// const sendDairyOrderConfirmationEmail = async (
//   email,
//   items,
//   totalAmount,
//   address,
//   orderId,
//   deliveryBoy = null
// ) => {
//   try {
//     // Send to customer
//     await sendOrderConfirmationEmail(
//       email,
//       items,
//       totalAmount,
//       address,
//       orderId,
//       deliveryBoy,
//       false // Not admin
//     );
    
//     // Send same format to admin
//     await sendOrderConfirmationEmail(
//       process.env.EMAIL_USER, // Admin email
//       items,
//       totalAmount,
//       address,
//       orderId,
//       deliveryBoy,
//       true // Is admin
//     );
    
//     console.log(`Order confirmation emails sent to customer (${email}) and admin (${process.env.EMAIL_USER})`);
//     return true;
//   } catch (error) {
//     console.error("Error in sendDairyOrderConfirmationEmail:", error);
//     throw error;
//   }
// };

// /**
//  * Sends delivery assignment email to delivery boy
//  */
// const User = require('../models/User');
// const sendDeliveryAssignmentEmail = async (deliveryBoy, order, assignment) => {
//   console.log("welome to send emailer dvdfg")
//   try {
//     // if (!deliveryBoy || !deliveryBoy.email) {
//       //   console.error("Delivery boy email not available");
//       //   return false;
//       // }
      
//       // Get customer details
      
//     console.log("delivery Boy",deliveryBoy)
//     console.log(order.items)
//     let customer = null;
//     try {
//       if (order.userId) {
//         customer = await User.findById(order.userId);
//       }
//     } catch (err) {
//       console.error('Error fetching customer details:', err);
//     }
    
//     // Format items for email
//     const formattedItems = [];
    
//     if (order.items && order.items.length > 0) {
//       // Populate product details if not already populated
//       if (!order.populated('items.productId')) {
//         await order.populate({
//           path: 'items.productId',
//           select: 'productName price image unit'
//         });
//       }
      
//       // Format each item
//       for (const item of order.items) {
//         const productId = item.productId || {};
//         formattedItems.push({
//           name: productId.productName || item.productName || 'Product',
//           quantity: item.quantity || 1,
//           price: productId.price || item.price || 0,
//           unit: productId.unit || item.unit || '',
//           image: productId.image || null,
//           totalPrice: ((item.quantity || 1) * (productId.price || item.price || 0)).toFixed(2)
//         });
//       }
//     }
    
//     // Send email to delivery boy
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//       tls: {
//         rejectUnauthorized: false
//       },
//       secure: true
//     });
    
//     console.log("upoming deliver boy",deliveryBoy)

//     const mailOptions = {
//       from: {
//         name: "Parshuram Dairy",
//         address: process.env.EMAIL_USER
//       },
//       to: deliveryBoy,
//       subject: "🚚 New Delivery Assignment",
//       html: `
//         <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;">
//           <div style="background-color: #2196F3; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
//             <h1 style="color: white; margin: 0; font-size: 24px;">New Delivery Assignment</h1>
//           </div>
          
//           <div style="padding: 25px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; background-color: #fff;">
//             <p style="font-size: 16px;">Hello ${deliveryBoy.name || 'Delivery Partner'},</p>
//             <p style="font-size: 16px;">You have been assigned a new order for delivery. Please find the details below:</p>
            
//             <div style="margin-bottom: 25px; padding: 15px; background-color: #f0f8ff; border-radius: 8px; border-left: 4px solid #2196F3;">
//               <h3 style="margin-top: 0; color: #333; font-size: 18px;">Order Information:</h3>
//               <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order?._id.toString().slice(-6)} (${order?._id})</p>
//               <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt || order.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
//               <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod || 'N/A'}</p>
//               <p style="margin: 5px 0;"><strong>Payment Status:</strong> ${order.payment ? 'Paid' : 'Pending'}</p>
//               <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${assignment?.toFixed(2) || '0.00'}</p>
//             </div>
            
//             <!-- Customer Information -->
//             ${customer ? `
//             <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 8px; border-left: 4px solid #2196F3;">
//               <h3 style="margin-top: 0; color: #333; font-size: 18px;">Customer Information:</h3>
//               <p style="margin: 5px 0;"><strong>Name:</strong> ${customer.firstName || ''} ${customer.lastName || ''}</p>
//               <p style="margin: 5px 0;"><strong>Phone:</strong> ${customer.phone || 'N/A'}</p>
//             </div>
//             ` : ''}
            
//             <!-- Delivery Address -->
//             <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 8px; border-left: 4px solid #2196F3;">
//               <h3 style="margin-top: 0; color: #333; font-size: 18px;">Delivery Address:</h3>
//               <p style="margin: 5px 0;"><strong>Street:</strong> ${order.address?.street || 'N/A'}</p>
//               <p style="margin: 5px 0;"><strong>Landmark:</strong> ${order.address?.landmark || 'N/A'}</p>
//               <p style="margin: 5px 0;"><strong>City:</strong> ${order.address?.city || 'N/A'} ${order.address?.zipcode || ''}</p>
//               <p style="margin: 5px 0;"><strong>State:</strong> ${order.address?.state || 'N/A'}, ${order.address?.country || 'India'}</p>
//               <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.address?.phone || 'Not provided'}</p>
//             </div>
            
//             <!-- Product Details -->
//             <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 8px; border-left: 4px solid #2196F3;">
//               <h3 style="margin-top: 0; color: #333; font-size: 18px;">Product Details:</h3>
//               <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
//                 <thead>
//                   <tr style="background-color: #f5f5f5;">
//                     <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Product</th>
//                     <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Quantity</th>
//                     <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
//                     <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   ${formattedItems.map(item => `
//                     <tr>
//                       <td style="padding: 10px; border: 1px solid #ddd;">
//                         <strong>${item.name}</strong>
//                       </td>
//                       <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
//                         ${item.quantity} ${item.unit}
//                       </td>
//                       <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">
//                         ₹${parseFloat(item.price).toFixed(2)}
//                       </td>
//                       <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">
//                         ₹${item.totalPrice}
//                       </td>
//                     </tr>
//                   `).join('')}
//                 </tbody>
//                 <tfoot>
//                   <tr style="background-color: #f8f8f8; font-weight: bold;">
//                     <td colspan="3" style="padding: 10px; border: 1px solid #ddd; text-align: right;">Total:</td>
//                     <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #28a745;">₹${assignment?.toFixed(2) || '0.00'}</td>
//                   </tr>
//                 </tfoot>
//               </table>
//             </div>
            
//             <div style="margin: 30px 0; text-align: center;">
//               <p style="font-size: 16px; font-weight: bold; color: #2196F3;">Please deliver this order as soon as possible.</p>
//               <p style="font-size: 14px; color: #666;">You can update the delivery status through your delivery app or by contacting the admin.</p>
//             </div>
            
//             <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
            
//             <p style="font-size: 14px; color: #777; text-align: center;">
//               Thank you for your service!<br>
//               <strong>Parshuram Dairy Team</strong>
//             </p>
//           </div>
//         </div>
//       `
//     };

//     await transporter.sendMail(mailOptions);
    
//     // Also update the customer with delivery boy details
//     if (customer && customer.email) {
//       // Update customer that their order is out for delivery with delivery boy details
//       await sendDairyOrderConfirmationEmail(
//         customer.email,
//         formattedItems,
//         order.totalAmount,
//         order.address,
//         order._id,
//         deliveryBoy
//       );
//     }
    
//     console.log(`Delivery assignment email sent to ${deliveryBoy.name} (${deliveryBoy.email})`);
//     return true;
//   } catch (error) {
//     console.error("Error sending delivery assignment email:", error);
//     return false;
//   }
// };

// /**
//  * Sends notification to admin about order assignment or status change
//  */
// const sendAdminNotificationEmail = async (order, status, notes, deliveryBoy) => {
//   try {
//     // Get customer details
//     const User = require('../models/User');
//     let customer = null;
//     try {
//       if (order.userId) {
//         customer = await User.findById(order.userId);
//       }
//     } catch (err) {
//       console.error('Error fetching customer details:', err);
//     }
    
//     // Format items for email
//     const formattedItems = [];
    
//     if (order.items && order.items.length > 0) {
//       // Populate product details if not already populated
//       if (!order.populated('items.productId')) {
//         await order.populate({
//           path: 'items.productId',
//           select: 'productName price image unit'
//         });
//       }
      
//       // Format each item
//       for (const item of order.items) {
//         const productId = item.productId || {};
//         formattedItems.push({
//           name: productId.productName || item.productName || 'Product',
//           quantity: item.quantity || 1,
//           price: productId.price || item.price || 0,
//           unit: productId.unit || item.unit || '',
//           image: productId.image || null,
//           totalPrice: ((item.quantity || 1) * (productId.price || item.price || 0)).toFixed(2)
//         });
//       }
//     }
    
//     // If we have a delivery boy, use the same format as customer email
//     if (deliveryBoy) {
//       await sendDairyOrderConfirmationEmail(
//         process.env.EMAIL_USER, // Admin email
//         formattedItems,
//         order.totalAmount,
//         order.address,
//         order._id,
//         deliveryBoy
//       );
//       return true;
//     }
    
//     // Otherwise, send a status update notification
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//       tls: {
//         rejectUnauthorized: false
//       },
//       secure: true
//     });
    
//     // Set status color based on status
//     let statusColor;
//     switch(status) {
//       case 'In Progress':
//         statusColor = '#ff9800'; // Orange
//         break;
//       case 'Delivered':
//         statusColor = '#4CAF50'; // Green
//         break;
//       case 'Failed':
//         statusColor = '#f44336'; // Red
//         break;
//       case 'Assigned':
//         statusColor = '#2196F3'; // Blue
//         break;
//       case 'Pending Assignment':
//         statusColor = '#9C27B0'; // Purple
//         break;
//       case 'Assignment Failed':
//         statusColor = '#f44336'; // Red
//         break;
//       default:
//         statusColor = '#607D8B'; // Blue Grey
//     }
    
//     const mailOptions = {
//       from: {
//         name: "Parshuram Dairy System",
//         address: process.env.EMAIL_USER
//       },
//       to: process.env.EMAIL_USER, // Admin email
//       subject: `[ADMIN] Order #${order._id.toString().slice(-6)} Status: ${status}`,
//       html: `
//         <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;">
//           <div style="background-color: ${statusColor}; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
//             <h1 style="color: white; margin: 0; font-size: 24px;">Order Status Update: ${status}</h1>
//           </div>
          
//           <div style="padding: 25px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; background-color: #fff;">
//             <div style="margin-bottom: 25px; padding: 15px; background-color: #f0f8ff; border-radius: 8px; border-left: 4px solid ${statusColor};">
//               <h3 style="margin-top: 0; color: #333; font-size: 18px;">Order Information:</h3>
//               <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order._id.toString().slice(-6)} (${order._id})</p>
//               <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt || order.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
//               <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status}</span></p>
//               <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod || 'N/A'}</p>
//               <p style="margin: 5px 0;"><strong>Payment Status:</strong> ${order.payment ? 'Paid' : 'Pending'}</p>
//               <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${order.totalAmount.toFixed(2)}</p>
//               ${notes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${notes}</p>` : ''}
//             </div>
            
//             <!-- Customer Information -->
//             <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 8px; border-left: 4px solid ${statusColor};">
//               <h3 style="margin-top: 0; color: #333; font-size: 18px;">Customer Information:</h3>
//               <p style="margin: 5px 0;"><strong>Name:</strong> ${customer ? `${customer.firstName || ''} ${customer.lastName || ''}` : 'N/A'}</p>
//               <p style="margin: 5px 0;"><strong>Email:</strong> ${customer ? customer.email || 'N/A' : 'N/A'}</p>
//               <p style="margin: 5px 0;"><strong>Phone:</strong> ${customer ? customer.phone || 'N/A' : 'N/A'}</p>
//               <p style="margin: 5px 0;"><strong>Customer ID:</strong> ${customer ? customer._id : 'N/A'}</p>
//             </div>
            
//             <!-- Delivery Address -->
//             <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 8px; border-left: 4px solid ${statusColor};">
//               <h3 style="margin-top: 0; color: #333; font-size: 18px;">Delivery Address:</h3>
//               <p style="margin: 5px 0;"><strong>Street:</strong> ${order.address ? order.address.street || 'N/A' : 'N/A'}</p>
//               <p style="margin: 5px 0;"><strong>Landmark:</strong> ${order.address ? order.address.landmark || 'N/A' : 'N/A'}</p>
//               <p style="margin: 5px 0;"><strong>City:</strong> ${order.address ? order.address.city || 'N/A' : 'N/A'} ${order.address ? order.address.zipcode || '' : ''}</p>
//               <p style="margin: 5px 0;"><strong>State:</strong> ${order.address ? order.address.state || 'N/A' : 'N/A'}, ${order.address ? order.address.country || 'India' : 'N/A'}</p>
//               <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.address ? order.address.phone || 'Not provided' : 'N/A'}</p>
//             </div>
            
//             <!-- Product Details -->
//             <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 8px; border-left: 4px solid ${statusColor};">
//               <h3 style="margin-top: 0; color: #333; font-size: 18px;">Product Details:</h3>
//               <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
//                 <thead>
//                   <tr style="background-color: #f5f5f5;">
//                     <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
//                     <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Quantity</th>
//                     <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
//                     <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   ${formattedItems.map(item => `
//                     <tr>
//                       <td style="padding: 12px; border-bottom: 1px solid #eee;">
//                         <strong>${item.name}</strong>
//                       </td>
//                       <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
//                         ${item.quantity} ${item.unit}
//                       </td>
//                       <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
//                         ₹${parseFloat(item.price).toFixed(2)}
//                       </td>
//                       <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
//                         ₹${item.totalPrice}
//                       </td>
//                     </tr>
//                   `).join('')}
//                 </tbody>
//                 <tfoot>
//                   <tr style="background-color: #f9f9f9; font-weight: bold;">
//                     <td colspan="3" style="padding: 12px; text-align: right; border-top: 2px solid #ddd;">Total:</td>
//                     <td style="padding: 12px; text-align: right; border-top: 2px solid #ddd;">₹${order.totalAmount.toFixed(2)}</td>
//                   </tr>
//                 </tfoot>
//               </table>
//             </div>
            
//             <div style="margin: 30px 0; text-align: center;">
//               <a href="${process.env.ADMIN_DASHBOARD_URL || 'https://parshuram-dairy.com/admin'}/orders/${order._id}" 
//                  style="display: inline-block; padding: 14px 30px; background-color: ${statusColor}; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
//                 View Order in Dashboard
//               </a>
//             </div>
            
//             <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
            
//             <p style="font-size: 14px; color: #777; text-align: center;">
//               This is an automated message from the Parshuram Dairy System.
//             </p>
//           </div>
//         </div>
//       `
//     };

//     await transporter.sendMail(mailOptions);
//     console.log(`Admin notification email sent for Order ${order._id}`);
//     return true;
//   } catch (error) {
//     console.error("Error sending admin notification email:", error);
//     return false;
//   }
// };

// module.exports = {
//   sendDairyOrderConfirmationEmail,
//   sendDeliveryAssignmentEmail,
//   sendAdminNotificationEmail,
//   sendOrderConfirmationEmail // Export the base function as well
// };






const nodemailer = require("nodemailer");


/**
 * Creates and configures a nodemailer transporter
 * @returns {object} Configured nodemailer transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    },
    secure: true
  });
};

/**
 * Formats order items for display in email
 * @param {Array} items - Order items
 * @returns {string} HTML formatted items
 */
const formatItemsHtml = (items) => {
  return items
    .map(
      (item) => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px;">
            ${item.name || 'Product'}
          </td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">
            ${item.quantity || ''}
          </td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">
            Rs.${(item.price || 0).toFixed(2)}
          </td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">
            Rs.${((item.quantity * (item.price || 0)) || 0).toFixed(2)}
          </td>
        </tr>
      `
    )
    .join("");
};

/**
 * Creates delivery boy section for email
 * @param {object} deliveryBoy - Delivery boy details
 * @param {boolean} isAdmin - Whether email is for admin
 * @returns {string} HTML for delivery boy section
 */
const createDeliveryBoySection = (deliveryBoy, isAdmin) => {
  return deliveryBoy
    ? `
      <div style="margin-top: 20px; padding: 15px; background-color: #e3f2fd; border-radius: 5px; border-left: 4px solid #2196F3;">
        <h4 style="margin-top: 0; color: #2196F3;">🚚 Delivery Boy Details:</h4>
        <p style="margin-bottom: 5px;"><strong>Name:</strong> ${deliveryBoy.name || 'Not assigned yet'}</p>
        ${deliveryBoy.phone ? `<p style="margin-bottom: 5px;"><strong>Contact:</strong> ${deliveryBoy.phone}</p>` : ''}
        ${deliveryBoy.email ? `<p style="margin-bottom: 5px;"><strong>Email:</strong> ${deliveryBoy.email}</p>` : ''}
        <p style="margin-bottom: 0; font-style: italic; color: #666;">Your order will be delivered by the assigned delivery partner. ${!isAdmin ? 'You can contact them directly for any delivery-related queries.' : ''}</p>
      </div>
    `
    : `
      <div style="margin-top: 20px; padding: 15px; background-color: #fff4e5; border-radius: 5px; border-left: 4px solid #ff9800;">
        <h4 style="margin-top: 0; color: #ff9800;">🚚 Delivery Information:</h4>
        <p style="margin-bottom: 0;">A delivery partner will be assigned to your order soon. ${!isAdmin ? "You'll receive an update when your order is out for delivery." : "Please assign a delivery partner from the admin dashboard."}</p>
      </div>
    `;
};

const sendOrderConfirmationEmail = async (
  email,
  items,
  totalAmount,
  address,
  orderId,
  deliveryBoy = null,
  isAdmin = false,
  customer = null // ✅ Customer details parameter
) => {
  try {
    const transporter = createTransporter();

    // ✅ Fetch order details with customer populated
    const Order = require('../models/Order');
    const order = await Order.findById(orderId)
      .populate("userId", "name email phone") // Populate customer details
      .populate({
        path: 'items.productId',
        select: 'productName price image unit'
      });

    if (!order) {
      console.error(`❌ Order not found: ${orderId}`);
      return false;
    }

    // Get customer details from the populated userId or use provided customer data
    const customerData = customer || order.userId || { name: "N/A", email: "N/A", phone: "N/A" };
    if (!customerData) {
      console.error("⚠️ Customer details not found for this order.");
    }

    // ✅ Determine email subject
    let emailSubject = isAdmin
      ? `[ADMIN] Parshuram Dairy - Order #${orderId.toString().slice(-6)} ${deliveryBoy ? `Assigned to ${deliveryBoy.name}` : 'Pending Assignment'}`
      : deliveryBoy
        ? "Parshuram Dairy - Your Order is Out for Delivery!"
        : "Parshuram Dairy - Order Confirmation";

    // ✅ Format items for email
    const itemsHtml = formatItemsHtml(items);

    // ✅ Delivery Boy Section (Optional)
    const deliveryBoySection = createDeliveryBoySection(deliveryBoy, isAdmin);

    // ✅ Admin-specific Notes
    const adminNoteSection = isAdmin
      ? `
        <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px; border-left: 4px solid #607d8b;">
          <h4 style="margin-top: 0; color: #607d8b;">⚙️ Admin Actions:</h4>
          <p style="margin-bottom: 0;">This is an admin notification copy of the customer's order confirmation. ${!deliveryBoy ? 'Please assign a delivery partner to this order.' : 'A delivery partner has been assigned to this order.'}</p>
        </div>
      `
      : '';

    // ✅ Customer Information Section (Now included for Admin Emails)
    const customerSection = isAdmin
    ? `
      <div style="margin-top: 20px; padding: 20px; background-color: #f9f9f9; 
                  border-radius: 8px; border-left: 4px solid #2196F3;">
        <h3 style="margin-top: 0; margin-bottom: 15px; color: #333; font-size: 18px;">
          👤 Customer Information:
        </h3>
        <p style="margin: 10px 0;"><strong>Name:</strong> ${customerData.name}</p>
        <p style="margin: 10px 0;"><strong>Email:</strong> ${customerData.email}</p>
        <p style="margin: 10px 0;"><strong>Phone:</strong> ${customerData.phone}</p>
      </div>
    `
    : '';

    // ✅ Email HTML Content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #28a745;">
          <h1 style="color: #28a745; margin: 0;">Parshuram Dairy</h1>
          <p style="margin-top: 5px; font-size: 16px;">${isAdmin ? 'New Order Notification' : 'Thank you for your order!'}</p>
        </div>

        <div style="padding: 20px;">
          <p>Hello${isAdmin ? ' Admin' : ''},</p>
          <p>${isAdmin
        ? 'A new order has been placed. Here are the order details:'
        : (deliveryBoy
          ? 'Great news! Your order is now out for delivery with our delivery partner.'
          : 'Your order has been successfully placed. Here are your order details:')
      }</p>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #16a085; margin-top: 0;">🛒 Order Details:</h3>
            ${orderId ? `<p><strong>Order ID:</strong> #${orderId.toString().slice(-6)}</p>` : ''}
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Not specified'}</p>
          </div>

          <h3 style="color: #16a085;">📦 Ordered Items:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Product</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Items</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Price</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
            <h4 style="margin-top: 0; color: #007bff;">📍 Delivery Address:</h4>
            <p style="margin-bottom: 5px;">${address.street || ''}</p>
            <p style="margin-bottom: 5px;">${address.landmark || ''}</p>
            <p style="margin-bottom: 5px;">${address.city || ''} ${address.zipcode || ''}</p>
            <p style="margin-bottom: 5px;">${address.state || ''}, ${address.country || ''}</p>
          </div>

          ${customerSection}

          ${deliveryBoySection}

          ${adminNoteSection}

           ${!isAdmin ? `
      <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
        <p>If you have any questions about this order, please contact our customer support at 
          <a href="mailto:parshuramdairyfarm@gmail.com" style="color: #007bff;">parshuramdairyfarm@gmail.com</a> 
          or call us at +91-9172474779.
        </p>
        <p>Thanks for choosing <strong>Parshuram Dairy</strong> – Freshness You Can Trust!<br>
          <em>- The Parshuram Dairy Team</em>
        </p> 
      </div>
      ` : ''}
        </div>

        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d; border-top: 1px solid #eee;">
          <p>&copy; ${new Date().getFullYear()} Parshuram Dairy. All rights reserved.</p>
          <p>This is an automated email, please do not reply to this message.</p>
        </div>
      </div>
    `;

    const mailOptions = { from: process.env.EMAIL_USER, to: email, subject: emailSubject, html: htmlContent };
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${email}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

/**
 * Sends order confirmation email to customer and a copy to admin
 */
const sendDairyOrderConfirmationEmail = async (
  email,
  items,
  totalAmount,
  address,
  orderId,
  deliveryBoy = null
) => {
  try {
    // Send to customer
    await sendOrderConfirmationEmail(
      email,
      items,
      totalAmount,
      address,
      orderId,
      deliveryBoy,
      false // Not admin
    );

    // Send same format to admin
    await sendOrderConfirmationEmail(
      process.env.EMAIL_USER, // Admin email
      items,
      totalAmount,
      address,
      orderId,
      deliveryBoy,
      true // Is admin
    );

    console.log(`Order confirmation emails sent to customer (${email}) and admin (${process.env.EMAIL_USER})`);
    return true;
  } catch (error) {
    console.error("Error in sendDairyOrderConfirmationEmail:", error);
    throw error;
  }
};

const sendDeliveryAssignmentEmail = async (deliveryBoyEmail, orderId, totalAmount) => {
  try {
    if (!deliveryBoyEmail) {
      console.error("❌ Delivery boy email not available");
      return false;
    }

    // ✅ Import required models
    const Order = require('../models/Order');
    const DeliveryBoy = require('../models/DeliveryBoy');

    // ✅ Fetch order details with customer populated
    const order = await Order.findById(orderId)
      .populate({ path: "userId", select: "name email phone" }) // ✅ Fetch Customer details
      .populate({ path: "items.productId", select: "productName price image unit" })
      .exec(); // Ensure execution

    if (!order) {
      console.error(`❌ Order not found: ${orderId}`);
      return false;
    }

    // ✅ Fetch delivery boy details
    const deliveryBoy = await DeliveryBoy.findOne({ email: deliveryBoyEmail });

    if (!deliveryBoy) {
      console.error(`⚠️ Delivery boy not found with email: ${deliveryBoyEmail}`);
    }

    // ✅ Get customer details
    const customer = order.userId;
    if (!customer) {
      console.error("⚠️ Customer details not found for this order.");
    }

    // ✅ Format items for email
    const formattedItems = order.items.map(item => ({
      name: item.productId?.productName || item.productName || 'Product',
      quantity: item.quantity || 1,
      price: item.productId?.price || item.price || 0,
      image: item.productId?.image || null,
      totalPrice: ((item.quantity || 1) * (item.productId?.price || item.price || 0)).toFixed(2)
    }));

    // ✅ Debugging Logs Before Sending Email
    console.log("📩 Sending Email with the following details:");
    console.log("📌 Delivery Boy:", deliveryBoy?.name || 'N/A', deliveryBoyEmail);
    console.log("📌 Customer:", customer?.name || 'N/A', customer?.email || 'N/A');
    console.log("📌 Order Address:", order.address);
    console.log("📌 Order Items:", formattedItems);
    console.log("📌 Order Total Amount:", order.totalAmount);

    // ✅ Create Email Transporter
    const transporter = createTransporter();

    // ✅ Email Content for Delivery Boy
    const mailOptions = {
      from: { name: "Parshuram Dairy", address: process.env.EMAIL_USER },
      to: deliveryBoyEmail,
      subject: "🚚 New Delivery Assignment",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #28a745;">
            <h1 style="color: #28a745; margin: 0;">Parshuram Dairy</h1>
            <p style="margin-top: 5px; font-size: 16px;">New Delivery Assignment</p>
          </div>

          <div style="padding: 20px;">
            <p>Hello ${deliveryBoy?.name || 'Delivery Partner'},</p>
            <p>You have been assigned a new order. Please find the details below:</p>

            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #16a085; margin-top: 0;">🛒 Order Details:</h3>
              <p><strong>Order ID:</strong> #${order._id.toString().slice(-6)}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt || order.date).toLocaleString()}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod || 'N/A'}</p>
              <p><strong>Payment Status:</strong> ${order.payment ? 'Paid' : 'Pending'}</p>
              <p><strong>Total Amount:</strong> ₹${totalAmount?.toFixed(2)}</p>
            </div>

            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196F3;">
              <h3 style="color: #2196F3; margin-top: 0;">👤 Customer Information:</h3>
              <p><strong>Name:</strong> ${customer?.name || 'N/A'}</p>
              <p><strong>Phone:</strong> ${customer?.phone || 'N/A'}</p>
              <p><strong>Email:</strong> ${customer?.email || 'N/A'}</p>
              <p style="margin-top: 10px; font-style: italic; color: #666;">Please contact the customer directly for any delivery-related queries.</p>
            </div>

            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #007bff; margin-top: 0;">📍 Delivery Address:</h3>
              <p><strong>Address:</strong> ${order.address?.street || 'N/A'}</p>
            </div>

            <h3 style="color: #16a085;">📦 Product Details:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="border: 1px solid #ddd; padding: 10px;">Product</th>
                  <th style="border: 1px solid #ddd; padding: 10px;">Items</th>
                  <th style="border: 1px solid #ddd; padding: 10px;">Price</th>
                  <th style="border: 1px solid #ddd; padding: 10px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${formattedItems.map(item => `
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 10px;">${item.name}</td>
                    <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${item.quantity}</td>
                    <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">₹${parseFloat(item.price).toFixed(2)}</td>
                    <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">₹${item.totalPrice}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              <p style="text-align: center; font-weight: bold;">Please deliver this order as soon as possible.</p>
              <p style="text-align: center; font-size: 14px; color: #777;">Thank you for your service!<br>Parshuram Dairy Team</p>
            </div>
          </div>

          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d; border-top: 1px solid #eee;">
            <p>&copy; ${new Date().getFullYear()} Parshuram Dairy. All rights reserved.</p>
            <p>This is an automated email, please do not reply to this message.</p>
          </div>
        </div>
      `
    };

    // ✅ Send Email to Delivery Boy
    await transporter.sendMail(mailOptions);

    // ✅ Notify Customer about Assigned Delivery Boy
    if (customer?.email) {
      const deliveryBoyInfo = deliveryBoy
        ? { name: deliveryBoy.name, phone: deliveryBoy.phone, email: deliveryBoy.email }
        : { name: "Assigned Delivery Partner", email: deliveryBoyEmail };

      await sendDairyOrderConfirmationEmail(
        customer.email,
        formattedItems,
        order.totalAmount,
        order.address,
        order._id,
        deliveryBoyInfo
      );
    }

    console.log(`✅ Delivery assignment email sent to ${deliveryBoyEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending delivery assignment email:", error);
    return false;
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendDairyOrderConfirmationEmail,
  sendDeliveryAssignmentEmail
};