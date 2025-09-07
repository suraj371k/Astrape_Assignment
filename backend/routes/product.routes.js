import express from "express";
import authenticate from "../middlewares/authenticate.js";
import upload from "../middlewares/multer.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  getProductSuggestions,
  getUserProducts,
  testAuth,
  updateProduct,
} from "../controllers/product.controller.js";

const router = express.Router();

router.post("/create", authenticate, upload.array("images"), createProduct);

router.get("/featured", getFeaturedProducts);

router.get("/suggestion", getProductSuggestions);

router.get("/user", authenticate, getUserProducts);
router.get("/test-auth", authenticate, testAuth);

router.get("/all", getAllProducts);
router.get("/:id", getProductById);
router.delete("/:id", authenticate, deleteProduct);
router.put("/:id", authenticate, upload.array("images"), updateProduct);

export default router;
