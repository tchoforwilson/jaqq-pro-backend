import multer from "multer";
import AppError from "./appError.js";

/**
 * @breif Multer memory storage
 */
const multerStorage = multer.memoryStorage();

/**
 * @breif Method to check if file uploaded is an image
 * @param {Request} req -> Request object
 * @param {File} file -> File field
 * @param {Callback} cb -> Callback function
 */
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};
// Maximum size of user uploaded file(photo) 1MB
const maxImageSize = 1 * 1000 * 1000;

/**
 * @brief multer utility to upload image
 */
export const upload = multer({
  storage: multerStorage,
  limits: { fileSize: maxImageSize },
  fileFilter: multerFilter,
});
