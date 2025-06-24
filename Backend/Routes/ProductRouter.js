const { ensureAuthenticated, ensureAdmin } = require("../Middlewares/Auth");
const router = require("express").Router();

// Regular user route
router.get("/", ensureAuthenticated, (req, res) => {
  res.status(200).json([
    {
      name: "Mobile",
      price: 10000,
    },
    {
      name: "Laptop",
      price: 20000,
    },
  ]);
});

// Admin-only route
router.get("/admin", ensureAdmin, (req, res) => {
  res.status(200).json({
    message: "Admin-only products",
    products: [
      {
        name: "Admin Mobile",
        price: 15000,
      },
      {
        name: "Admin Laptop",
        price: 30000,
      },
    ],
  });
});

module.exports = router;
