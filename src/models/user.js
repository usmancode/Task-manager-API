const mongoose = require("mongoose")
const validator = require('validator')
const task=require('./task')
console.log(process.env.MONGODB_URL)
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error(error.errors.email)
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error("Try differnet Password other than 'password'")
            }
        },
        trim: true,
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be in positive')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true

})
//**https://mongoosejs.com/docs/populate.html#populate-virtuals */
userSchema.virtual('user_tasks',{
    ref:'task',
    localField:'_id',
    foreignField:'owner'
})


userSchema.methods.toJSON=function(){
      
    const userobject =this.toObject()

    delete userobject.password
    delete userobject.tokens
    delete userobject.avatar

    return userobject
}

userSchema.methods.generateAuthToken = async function () {
    
     
       const generated_token=jwt.sign({_id:this._id.toString()},process.env.JWT_KEY)

       this.tokens=this.tokens.concat({token:generated_token})
       await this.save()

 
       return generated_token
    

}



userSchema.statics.findByCredentials = async (email, password) => {

    const valid_user = await user.findOne({
        email: email
    })

    if (!valid_user) {
        throw new Error("Unable to login")
    }
    const isMatch = await bcrypt.compare(password, valid_user.password)


    if (!isMatch) {
        throw new Error("Unable to login")
    }

    return valid_user

}



//**hasing the password for both when we create a new user and when we update user password */
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})


userSchema.pre('remove',async function(next){
    await task.deleteMany({owner:this._id})

    next()
})


const user = mongoose.model('user', userSchema)

// const newuser = new user({
//     name: 'Peeyush',
//     email: ' PEEYUSH@gmail.com      ',
//     password: 'usmank'


// })

// newuser.save().then((result) => {
//     console.log(newuser)
// }).catch((error) => {
//     console.log(error)
// })

module.exports = user