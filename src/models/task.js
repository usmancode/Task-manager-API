const mongoose = require("mongoose")


const taskSchema=new mongoose.Schema({
    description: {
        type: String,
        required:true,
        trim:true
    },
    completed: {
        type: Boolean,
        default:false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user'
    }
},{
    timestamps:true
})

const task = mongoose.model('task',taskSchema)

// const newtask = new task({
//    description:"kwnedsnkkds        rwsdajlmds                                 ",
    
// })

// newtask.save().then(() => {
//     console.log(newtask)
// }).catch((error) => {
//     console.log(error.errors.description.message)
// })

module.exports=task
