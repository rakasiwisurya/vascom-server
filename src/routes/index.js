const express = require("express");
const {
  login,
  register,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  avatar,
} = require("../controllers/users");
const {
  addProduct,
  updateProduct,
  getProducts,
  getProduct,
  deleteProduct,
} = require("../controllers/products");
const { getDashboard } = require("../controllers/dashboard");
const { auth } = require("../middlewares/auth");
const { upload } = require("../middlewares/upload");
const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/users", auth, getUsers);
router.get("/users/:id", auth, getUser);
router.put("/users/:id", auth, updateUser);
router.delete("/users/:id", auth, deleteUser);
router.put("/users/avatar/:id", auth, upload("avatar", process.env.UPLOAD_PATH_AVATAR), avatar);

router.post("/products", auth, upload("photo", process.env.UPLOAD_PATH_PRODUCT), addProduct);
router.get("/products", getProducts);
router.get("/products/:id", auth, getProduct);
router.put("/products/:id", auth, upload("photo", process.env.UPLOAD_PATH_PRODUCT), updateProduct);
router.delete("/products/:id", auth, deleteProduct);

router.get("/dashboard", auth, getDashboard);

module.exports = router;
