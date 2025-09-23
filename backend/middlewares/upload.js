import multer from 'multer';

// Accept only image files
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Multer in-memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

// Fields for S3 upload - accept common field name variations
const uploadApplicationFiles = upload.fields([
    { name: 'linkedin_screenshot', maxCount: 1 },
    { name: 'payment_screenshot', maxCount: 1 },
    { name: 'linkedinScreenshot', maxCount: 1 },
    { name: 'paymentScreenshot', maxCount: 1 },
    { name: 'linkedin', maxCount: 1 },
    { name: 'payment', maxCount: 1 },
    { name: 'paymentProof', maxCount: 1 }
]);

// Error handler
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    }
    if (err.message === 'Only image files are allowed!') {
        return res.status(400).json({ error: err.message });
    }
    next(err);
};

export {
    uploadApplicationFiles,
    handleUploadError
};
