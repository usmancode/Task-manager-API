const express = require('express')
require('./db/mongoose')
// const auth=require('./middleware/auth')
const app = express()

const userRouter=require('./routers/user_router')
const taskRouter=require('./routers/task_router')

const port = process.env.PORT

// app.use((req,res,next)=>{
//     res.status(503).send("Site underConstrustion")

// })



// app.use(auth)
app.use(express.json())

app.use(userRouter)
app.use(taskRouter)




app.listen(port, () => {
    console.log("Server is running on port " + port)
})



