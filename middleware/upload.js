// import multer from "multer";

// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// export const handleHeroImageUpload = upload.single("image");


import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Hero section — single image field named "image"
export const handleHeroImageUpload = upload.single("image");

// Gallery — also single image field named "image"
// export const handleGalleryImageUpload = upload.single("image");
export const handleGalleryImageUpload = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    console.log("=== UPLOAD DEBUG ===");
    console.log("Multer error:", err);
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);
    next(err);
  });
};

export default upload;