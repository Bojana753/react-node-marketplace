import express from "express";
import productController from "../controllers/productControllers.js"; 
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", productController.getAll);
router.get("/my", protect, productController.getMine);
router.get('/my-purchases', protect, productController.getMyPurchases);
router.get('/for-approval', protect, productController.getForSellerApproval);
router.get('/my-sales', protect, productController.getMySoldProducts);


router.get("/:id", productController.getOne);


router.post("/:id/cancel", protect, productController.cancelPurchase);
router.patch("/:id/status", protect, productController.updateStatus);
router.post("/:id/bid", protect, productController.placeBid);
router.post("/:id/end-auction", protect, productController.endAuction);

router.post("/", protect, productController.create);
router.put("/:id", protect, productController.update);
router.delete("/:id", protect, productController.deleteLogical);

export default router;