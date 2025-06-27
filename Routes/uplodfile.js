import cloudinary from "../cloudinary.js";
import express from "express";
import formidable from "formidable";
import fs from "fs";
import usermodel from '../models/usermodel.js'
const router = express.Router();


router.post('/uploadfile/:id', (req, res) => {
    const form = formidable({ multiples: false, uploadDir: './storage', keepExtensions: true });
    form.parse(req, async (err, fields, files) => {
        if (err || !files.file) {
            return res.status(500).send({
                success: false,
                message: 'File upload failed',
                error: err.message
            });
        }
        const file = files.file;
        try {
            const result = await cloudinary.uploader.upload(file.filepath, {
                resource_type: 'auto',
                folder: 'storage'
            });

            fs.unlinkSync(file.filepath)
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
                    FILE_NAME: result.originalFilename,
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
                message: 'File upload failed',
                error: error.message
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
            error: error.message
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
            error: error.message
        });
    }
})