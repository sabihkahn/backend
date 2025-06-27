import mongoose from "mongoose";

function connectedDB(){
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log('connected to database ')
    }).catch(()=>{
        console.log('ni hua connect')
    })
}
export default connectedDB