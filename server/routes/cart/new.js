const CART = require("../../data/cart.json");
const itemData = require("../../data/items.json");
const { v4: uuidv4 } = require("uuid");

// This is to fix the data by removing the $ to the prices
const ITEMS = itemData.map((item) => {
  const price = parseFloat(
    Math.round(parseFloat(item.price.substring(1) * 100).toFixed(2)) / 100
  ).toFixed(2);

  // data = [{ ...items }];
  return {
    ...item,
    price: price,
  };
});

//  ################## OBTAIN CART ##########################

// There should be no req.body for this GET request to "/cart"

const getCart = (req, res) => {
  const totalQuantity = Object.values(CART).reduce(
    (sum, q) => sum + q.quantity,
    0
  );
  const totalPrice = Object.values(CART).reduce(
    (sum, price) => sum + price.price * price.quantity,
    0
  );
  try {
    return res.status(200).json({
      success: true,
      CART,
      totalQuantity: totalQuantity,
      totalPrice: totalPrice,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// ################# ADD ITEM TO CART ###################

// the expected body of the POST request to "/cart"
// Body: {id: "1234", quantity: 2};

// this endpoint is expected to return the current cart as it is and
// it should look like this

// CART = {
//   [itemId]: {
//     id,
//     name,
//     price,
//     quantity,
//   }
// }

const addToCart = (req, res) => {
  const reqId = req.body.id;
  const reqQuantity = req.body.quantity;
  console.log("Item Request is:", reqId);
  console.log("Body sent is", req.body);

  // Check if this id is valid
  if (!reqId) {
    return res.status(404).json({
      success: false,
      error: "No item found",
    });
  }

  // Lookup the item in question from the current inventory to be stored
  // in the response body if this is a new item.

  const cartItem = ITEMS.find((item) => item._id === reqId);

  // verfiy that this new item is not already in the cart, if it is
  // then we just update its quantity, otherwise create a new object in the
  // cart.

  const cartIDs = Object.keys(CART).map(Number);
  const alreadyHasItem = cartIDs.find((key) => key === reqId);

  try {
    if (alreadyHasItem) {
      CART[reqId].quantity += reqQuantity;
    } else {
      CART[reqId] = {
        id: cartItem._id,
        name: cartItem.name,
        price: cartItem.price,
        quantity: reqQuantity,
      };
    }

    // Update the total quantity of the cart items
    const totalQuantity = Object.values(CART).reduce(
      (sum, q) => sum + q.quantity,
      0
    );
    const totalPrice = Object.values(CART).reduce(
      (sum, price) => sum + price.price * price.quantity,
      0
    );

    return res.status(200).json({
      success: true,
      CART,
      totalQuantity: totalQuantity,
      totalPrice: totalPrice.toFixed(2),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: error,
      error: "Server Error",
    });
  }
};

// ################# DELETE ITEM FROM CART ###################

// // the expected body of the DELETE request to "/cart/:id"
// Body: {id: "1234"}

const removeFromCart = (req, res) => {
  const reqId = req.body.id;

  if (!reqId) {
    return res.status(404).json({
      success: false,
      error: "No item found",
    });
  }

  try {
    // delete the item in question from the CART database
    delete CART[reqId];

    // Update the total quantity of the cart items
    const totalQuantity = Object.values(CART).reduce(
      (sum, q) => sum + q.quantity,
      0
    );
    const totalPrice = Object.values(CART).reduce(
      (sum, price) => sum + price.price * price.quantity,
      0
    );

    return res.status(201).json({
      success: true,
      CART,
      totalQuantity: totalQuantity,
      totalPrice: totalPrice,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// ######################## CLEAR CART ########################

// Expected from the DELETE request to "/cart"
// We want to use the delete keyword on every object in the CART
// first by creating an array of number keys to delete from the CART object

const clearCart = (req, res) => {
  const cartIDs = Object.keys(CART).map(Number);

  try {
    cartIDs.map((key) => delete CART[key]);
    return res.status(200).json({
      success: true,
      CART,
      totalQuantity: 0,
      totalPrice: 0,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

module.exports = { getCart, addToCart, removeFromCart, clearCart };
