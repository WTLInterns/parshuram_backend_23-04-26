
// const Cart = require('../models/Cart');
// const Product = require('../models/Product');
// const mongoose = require('mongoose');
// const User = require('../models/User');

// // Add item to cart
// const addItemToCart = async (req, res) => {
//   try {
//     console.log(req.body);
    
//     const { productId, size,color, quantity = 1} = req.body;
//     const userId = req.user._id;

//     // Validate productId and quantity
//     if (!mongoose.Types.ObjectId.isValid(productId) || quantity < 1) {
//       return res.status(400).json({ message: 'Invalid product ID or quantity' });
//     }

//     // Check if product exists
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     // Find the user to get the userName
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Find or create cart
//     let cart = await Cart.findOneAndUpdate(
//       { userId },
//       { $set: { userName: user.name } }, // Update userName if it has changed
//       { new: true, upsert: true, setDefaultsOnInsert: true }
//     );

//     // Check if the product already exists in the cart
//     const productExists = cart.items.find(
//       (item) => item.productId.equals(productId) && item.size === size
//     );
//     if (productExists) {
//       productExists.quantity += quantity; // Increment quantity
//     } else {
//       cart.items.push({ productId: productId, size,color, quantity }); // Add new item with quantity
//     }

//     await cart.save();
//     res.status(201).json({ message: 'Item added to cart', cart });
//   } catch (error) {
//     res.status(500).json({ message: 'Error adding item to cart', error: error.message });
//   }
// };

// // Rest of the controller methods remain the same
// const getUserCart = async (req, res) => {
//   try {
//     // const {userId} = req.body
//     const userId = req.user._id;
//     console.log(userId)
//     if(!userId){
//       return res.status(404).json({ message: 'user is not found' });
//     }
//     let cart = await Cart.findOne({userId});
//     if (!cart) {
//       // Return an empty cart structure if no cart is found
//       cart = { items: []};
//     }
//     res.status(200).json(cart);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching cart', error: error.message });
//   }
// };

// const removeItemFromCart = async (req, res) => {
//   try {
//     const { productId, size } = req.body;

//     // Validate the productId
//     if (!mongoose.Types.ObjectId.isValid(productId)) {
//       return res.status(400).json({ message: 'Invalid product ID' });
//     }

//     const cart = await Cart.findOne({ userId: req.user._id });
//     if (!cart) return res.status(404).json({ message: 'Cart not found' });

//     // Filter the items by both productId and size
//     const itemIndex = cart.items.findIndex(item => item.productId.equals(productId) && item.size === size);

//     // If the item is found, remove it
//     if (itemIndex !== -1) {
//       cart.items.splice(itemIndex, 1);
//       await cart.save();

//       return res.status(200).json({ message: 'Item removed from cart', cart });
//     } else {
//       return res.status(404).json({ message: 'Item not found in cart' });
//     }

//   } catch (error) {
//     res.status(500).json({ message: 'Error removing item from cart', error: error.message });
//   }
// };

// const updateItemQuantity = async (req, res) => {
//   try {
//     const { productId, quantity } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(productId) || !quantity || quantity <= 0) {
//       return res.status(400).json({ message: 'Invalid product ID or quantity' });
//     }

//     const cart = await Cart.findOne({ user: req.user._id });
//     if (!cart) return res.status(404).json({ message: 'Cart not found' });

//     const item = cart.items.find((item) => item.product.equals(productId));
//     if (item) {
//       item.quantity = quantity;
//       await cart.save();
//       res.status(200).json({ message: 'Cart updated successfully', cart });
//     } else {
//       res.status(404).json({ message: 'Item not found in cart' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating cart', error: error.message });
//   }
// };

// const clearCart = async (req, res) => {
//   try {
//     const cart = await Cart.findOneAndDelete({ user: req.user._id });
//     if (!cart) return res.status(404).json({ message: 'Cart not found' });

//     res.status(200).json({ message: 'Cart cleared successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error clearing cart', error: error.message });
//   }
// };

// module.exports = {
//   addItemToCart,
//   getUserCart,
//   removeItemFromCart,
//   updateItemQuantity,
//   clearCart,
// };





const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const User = require("../models/User");

// const addItemToCart = async (req, res) => {
//   try {
//     const { productId,userId, quantity = 1 } = req.body; // Only productId and quantity are required now

//     // Validate productId and quantity
//     if (!mongoose.Types.ObjectId.isValid(productId) || quantity < 1) {
//       return res.status(400).json({ message: "Invalid product ID or quantity" });
//     }

//     // Check if product exists
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     // Log the product to verify that it contains name and description
//     console.log('Product:', product);

//     // Ensure productName and productDescription are defined
//     if (!product.name || !product.description) {
//       return res.status(400).json({ message: "Product name and description are required" });
//     }

//     // Find the user to get the userName
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Find or create cart
//     let cart = await Cart.findOneAndUpdate(
//       { userId },
//       { $set: { userName: user.name } }, // Update userName if it has changed
//       { new: true, upsert: true, setDefaultsOnInsert: true }
//     );

//     // Check if the product already exists in the cart
//     const productExists = cart.items.find(
//       (item) => item.productId.equals(productId)
//     );

//     if (productExists) {
//       // Increment quantity if product already exists
//       if (productExists.quantity + quantity > product.availableStock) {
//         return res.status(400).json({
//           message: `Not enough stock available. Only ${product.availableStock} left.`,
//         });
//       }
//       productExists.quantity += quantity; // Increment quantity
//     } else {
//       // Add new item with quantity details
//       if (quantity > product.availableStock) {
//         return res.status(400).json({
//           message: `Not enough stock available. Only ${product.availableStock} left.`,
//         });
//       }

//       // Add new item to cart
//       cart.items.push({
//         productId,
//         productName: product.name,           // Ensure productName is correctly assigned
//         productDescription: product.description, // Ensure productDescription is correctly assigned
//         price: product.price,
//         category: product.category,
//         subcategory: product.subcategory,
//         availableStock: product.availableStock,
//         images: Array.isArray(product.images) ? product.images : [], // Ensure images is an array of strings
//         quantity,
//       });
//     }

//     // Save the cart
//     await cart.save();
//     res.status(201).json({ message: "Item added to cart", cart });
//   } catch (error) {
//     console.error(error); // Log the error for easier debugging
//     res.status(500).json({ message: "Error adding item to cart", error: error.message });
//   }
// };

const addItemToCart = async (req, res) => {
  try {
    console.log(req.body);
    
    const { productId,userId, quantity, NoOfItems } = req.body;
  
    // Validate productId and quantity
    if (!mongoose.Types.ObjectId.isValid(productId) || quantity < 1) {
      return res.status(400).json({ message: 'Invalid product ID or quantity' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find the user to get the userName
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find or create cart
    let cart = await Cart.findOneAndUpdate(
      { userId },
      // { $set: { userName: user.name } }, // Update userName if it has changed
      // { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    if (!cart) {
      // ✅ Create a new cart if none exists
      cart = new Cart({
        userId,
        items: [],
      });
    }


    // Check if the product already exists in the cart
    const productExists = cart.items.find(
      (item) => item.productId.equals(productId)
    );
    if (productExists) {
      productExists.NoOfItems += NoOfItems; // Increment quantity
      console.log("qqq",quantity);
      
    } else {
      cart.items.push({ productId: productId, quantity, NoOfItems }); // Add new item with quantity
    }

    await cart.save();
    res.status(200).json({ message: 'Item added to cart', cart });
  } catch (error) {
    res.status(500).json({ message: 'Error adding item to cart', error: error.message });
  }
};
// Rest of the controller methods remain the same
const getUserCart = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("Fetching cart for user:", userId);
    
    if(!userId){
      return res.status(404).json({ message: 'User is not found' });
    }
    
    // Find cart
    let cart = await Cart.findOne({userId});
    
    if (!cart || !cart.items || cart.items.length === 0) {
      // Return an empty cart with a message to add products
      return res.status(200).json({ 
        items: [], 
        totalProduts: 0,
        message: "Your cart is empty. Please add some products first."
      });
    }

    // Populate product details
    await cart.populate({
      path: 'items.productId',
      model: 'Product',
      select: 'productName price image availableStock unit'
    });
    
    // Convert to plain object to modify
    cart = cart.toObject();
    
    // Check for missing products and add appropriate flags
    let invalidProductCount = 0;
    
    cart.items = cart.items.map(item => {
      if (!item.productId) {
        invalidProductCount++;
        return {
          ...item,
          productMissing: true,
          productInfo: {
            productName: "Product Unavailable",
            price: 0,
            image: "",
            availableStock: 0,
            unit: ""
          }
        };
      }
      return item;
    });
    
    // Add metadata about invalid products
    if (invalidProductCount > 0) {
      cart.hasInvalidProducts = true;
      cart.invalidProductCount = invalidProductCount;
      cart.message = `${invalidProductCount} product(s) in your cart are no longer available.`;    }
    
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching cart', 
      error: error.message 
    });
  }
};

const removeItemFromCart = async (req, res) => {
  try {
    const { productId, size } = req.body;

    // Validate the productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Filter the items by both productId and size
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.equals(productId) && item.size === size
    );

    // If the item is found, remove it
    if (itemIndex !== -1) {
      cart.items.splice(itemIndex, 1);
      await cart.save();

      return res.status(200).json({ message: "Item removed from cart", cart });
    } else {
      return res.status(404).json({ message: "Item not found in cart" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing item from cart", error: error.message });
  }
};

const updateItemQuantity = async (req, res) => {
  try {
      const { userId } = req.body; // Get userId from request body
      console.log("Received userId:", userId); // Debugging

      if (!userId) {
          return res.status(400).json({ message: "User ID is required" });
      }

      const cart = await Cart.findOne({ userId });
      console.log("Fetched Cart:", cart); // Debugging

      if (!cart || !cart.items || cart.items.length === 0) {
          return res.json({ cartCount: 0 });
      }

      const cartCount = cart.items.length; // Number of unique products in cart
      console.log("Cart Count (Unique Items):", cartCount); // Debugging

      res.json({ cartCount });

  } catch (error) {
      console.error("Error fetching cart count:", error);
      res.status(500).json({ message: "Server error", error });
  }
};



const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndDelete({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error clearing cart", error: error.message });
  }
};



// const updatecartStatus = async (req,res)=>{
//   try {
//     const {totalProduts,userId} = req.body;
//     if(!totalProduts){
//       res.status(400).json({message:"provide the Total statsu of produt in art"})
//     }

//     const cart = await Cart.findOne({userId})
//     cart.totalProduts = totalProduts
//     await cart.save()
//     res.status(200).json({message:"updated"})
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error while updating", error: error.message });
//   }
// }

const updatecartStatus = async (req, res) => {
  try {
    const { userId, totalProducts } = req.body;

    if (!userId) {
       res.status(400).json({ error: "User ID is required" }); // ✅ Return to stop execution
    }

    // Find the user's cart
    const cart = await Cart.findOne({ userId });

    if (!cart) {
       res.status(404).json({ error: "Cart not found" }); // ✅ Return to stop execution
    }

    // Update totalProducts in the cart
    cart.totalProducts = totalProducts;
    await cart.save();

     res.status(200).json({ message: "Cart updated successfully", cart }); // ✅ Only one response
  } catch (error) {
    console.error("Error updating cart status:", error);

    // ✅ Check if headers are already sent before sending response
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
};


module.exports = {
  addItemToCart,
  getUserCart,
  removeItemFromCart,
  updateItemQuantity,
  clearCart,
  updatecartStatus
};