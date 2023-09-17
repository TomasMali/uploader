const uploadFile = require("../middleware/upload");
const fs = require("fs");
const path = require('path');

//const baseUrl = "http://localhost:8088/files/";
 const baseUrl = "https://tomasmali.it/uploader/files/";

const upload = async (req, res) => {
  try {
    await uploadFile(req, res);

    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }

    res.status(200).send({
      message: "Uploaded the file successfully: " + req.file.originalname,
    });
  } catch (err) {
    console.log(err);

    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size cannot be larger than 10GB!",
      });
    }

    res.status(500).send({
      message: `Could not upload the file: ${req.file.originalname}. ${err}`,
    });
  }
};

async function processFiles(directoryPath, baseUrl) {
  const fileInfos = [];

  const files = fs.readdirSync(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);

    try {
      const stats = await fs.promises.stat(filePath);

      if (stats.isFile()) {
        const fileInfo = {
          name: file,
          url: `${baseUrl}/${file}`,
          size: stats.size, // File size in bytes
          createdAt: stats.birthtime, // Creation date
          updatedAt: stats.mtime, // Last modification date
        };

        fileInfos.push(fileInfo);
      }
    } catch (err) {
      console.error(`Error reading metadata for ${file}: ${err.message}`);
    }
  }
  return fileInfos;
}

const getListFiles = async (req, res) => {
  const directoryPath = __basedir + "/resources/static/assets/uploads/";
  const fileInfos = await processFiles(directoryPath, baseUrl);
  res.status(200).send(fileInfos);
};


const download = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
};

const remove = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/static/assets/uploads/";
  console.log(fileName)
  fs.unlink(directoryPath + fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not delete the file. " + err,
      });
    }

    res.status(200).send({
      message: "File is deleted.",
    });
  });
};

const removeSync = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  try {
    fs.unlinkSync(directoryPath + fileName);

    res.status(200).send({
      message: "File is deleted.",
    });
  } catch (err) {
    res.status(500).send({
      message: "Could not delete the file. " + err,
    });
  }
};

module.exports = {
  upload,
  getListFiles,
  download,
  remove,
  removeSync,
};
