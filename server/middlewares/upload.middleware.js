import multer from "multer";
import path from "path";

const sotrage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp3|wav|m4a|mp4|mov|avi|mkv/;
  const ext = path.extname(file.originalname).toLocaleLowerCase();
  const mimeType = file.mimetype;

  if (allowedTypes.test(ext) && allowedTypes.test(mimeType)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({
  sotrage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload