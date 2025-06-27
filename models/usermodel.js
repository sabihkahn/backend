import mongoose from "mongoose";

const fileuploadSchema = new mongoose.Schema({
    name: String,
    size: Number,
    type: String,
    url: String,
    public_id: String,
    uploadedAt: {
        type: Date,
        default: Date.now
    }
})

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: [10, 'email must be atleast 10 to 13 character long'],
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: [5, 'password cant be cant be less ten 5 character long']
    },
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'email must be atleast 4 '],
        unique: true
    },
    files: [fileuploadSchema]

})
const user = mongoose.model('userdata', userSchema)

export default user