import cloudinary from "../cloudinary.js";
import express from "express";
import formidable from "formidable";
import fs from "fs";
import usermodel from '../models/usermodel.js'
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.post('/uploadfile/:id', async (req, res) => {
  const form = formidable({
    uploadDir: '/tmp',           // ✅ Safe for Railway
    keepExtensions: true         // ✅ Keeps file extension (e.g. .pdf, .jpg)
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(500).send({
        success: false,
        message: 'Error parsing the file',
        error: err.message
      });
    }

    try {
      const file = files.file[0]; // may be `files.file` based on your version
      const { filepath } = file;
      console.log("Uploading from:", filepath);

      const result = await cloudinary.uploader.upload(filepath, {
        resource_type: 'raw', // for all types: pdf, zip, etc.
      });

      // Check if user exists
      const user = await usermodel.findById(req.params.id);
      if (!user) {
        return res.status(404).send({
          success: false,
          message: 'User not found'
        });
      }

      // Update user's files
      const updatedUser = await usermodel.findByIdAndUpdate(req.params.id, {
        $push: {
          files: {
            name: result.original_filename,
            size: result.bytes,
            type: result.format,
            url: result.secure_url,
            public_id: result.public_id,
            uploadedAt: new Date()
          }
        }
      }, { new: true });

      const mb = Math.floor(result.bytes / 1024 / 1024) + 'mb';

      return res.status(200).send({
        success: true,
        message: 'File uploaded successfully',
        data: {
          FILE_NAME: result.original_filename,
          FILE_SIZE: result.bytes,
          FILE_TYPE: result.format,
          type: result.resource_type + '/' + result.format,
          size: mb,
          url: result.secure_url,
          public_id: result.public_id
        }
      });

    } catch (error) {
      console.error("Upload or DB error:", error);
      return res.status(500).send({
        success: false,
        message: 'File upload failed',
        error: error.message
      });
    }
  });
});

router.get('/getfile/:id', async (req, res) => {
    try {
        const id = req.params.id
        const user = await usermodel.findById(id)
        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).send({
            success: true,
            message: 'Files retrieved successfully',
            data: user.files
        });
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error retrieving files',
            error: error
        });
    }

})

router.delete('/deletefile/:id/:public_id', async (req, res) => {
    try {

        const { id, public_id } = req.params;
        const user = await usermodel.findById(id);
        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'User not found'
            });
        }

        const file = user.files.find(file => file.public_id === public_id);
        if (!file) {
            return res.status(404).send({
                success: false,
                message: 'File not found'
            });
        }
        const cloudinaryResponse = await cloudinary.uploader.destroy(file, {
            resource_type: 'raw'
        });
        res.status(200).send({
            success: true,
            message: 'File deleted successfully',
            data: cloudinaryResponse
        });

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error deleting file',
            error: error
        });
    }
})

export default router;