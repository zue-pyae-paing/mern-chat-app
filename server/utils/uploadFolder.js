export const uploadFolder = (mimetype) => {
  const folderMap = {
    "image/": "/images",
    "audio/": "/audios",
    "video/": "/videos",
  };
  for (const [key, folder] of Object.entries(folderMap)) {
    if (mimetype.startsWith(key)) {
      return folder;
    }
  }
  return "/others";
};

