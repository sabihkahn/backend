import cloudinary from "../cloudinary.js";
import express from "express";
import formidable from "formidable";
import fs from "fs";
import usermodel from '../models/usermodel.js'
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.post('/uploadfile/:id', async(req, res) => {
   formidable().parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).send({

                success: false,
                message: 'Error parsing the file',
                error: err
            });
        }
        const file = files.myfile;
         try {
            const result = await cloudinary.uploader.upload(file.filepath, {
                resource_type: 'auto',
            });

          console.log(result);
            // Check if the user exists
            const user = await usermodel.findById(req.params.id);
            if (!user) {
                return res.status(404).send({
                    success: false,
                    message: 'User not found'
                });
            }
            const id = req.params.id
            const userdatapush = await usermodel.findByIdAndUpdate(id, {
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

            res.status(200).send({
                success: true,
                message: 'File uploaded successfully',
                data: {
                    FILE_NAME: result.original_filename,
                    FILE_SIZE: result.bytes,
                    FILE_TYPE: result.format,
                    type: result.resource_type + '/' + result.format,
                    size: result.bytes,
                    url: result.secure_url,
                    public_id: result.public_id
                }
            })

        } catch (error) {
            console.log(error);
            return res.status(500).send({
                success: false,
                message: 'File upload failed h',
                error: error
            });
        }

    })
})





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

router.delete('/deletefile/:id/:fileId', async (req, res) => {
    try {

        const { id, fileId } = req.params;
        const user = await usermodel.findById(id);
        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'User not found'
            });
        }
        const file = user.files.id(fileId);
        if (!file) {
            return res.status(404).send({
                success: false,
                message: 'File not found'
            });
        }
        const cloudinaryResponse = await cloudinary.uploader.destroy(file.public_id, {
            resource_type: 'auto'
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