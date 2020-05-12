const express=require('express')

const task=require('../models/task')

const router=new express.Router()

const auth=require('../middleware/auth')

router.post('/tasks',auth, async (req, res) => {
   const newtask=new task({
       ...req.body,
       owner:req.valid_user._id
   })
    try {
        await newtask.save()
        res.status(201).send(newtask)
    } catch (e) {
        res.status(400).send(error)
    }

})
// GET/tasks?completed='true'
// GET /tasks?limit=10&skip=0
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks',auth,async (req, res) => {
    try {
           const match={}

           if(req.query.completed){
               match.completed=req.query.completed==='true'
           }

           const sort={}

           if(req.query.sortBy){
             const parts=req.query.sortBy.split(':')
             console.log(parts[1])
             sort[parts[0]]=parts[1]==='desc' ?-1:1
             //sort.completed will also use
            
           }
           
        
            //**https://mongoosejs.com/docs/populate.html#populate-virtuals */
           await req.valid_user.populate({
               path:'user_tasks',
               match,
               options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
               }

           }).execPopulate() 
           
            res.send(req.valid_user.user_tasks)
        
     

        // if(tasks.length==0){
        //     res.send("No task avilable Please create task ")
        // }
        // res.status(201).send(tasks)
    } catch (e) {
        res.status(500).send()
    }

})

router.get('/task/:id', auth,async (req, res) => {
    const _id = req.params.id
    try {
        const task_by_id = await task.findOne({ _id,owner:req.valid_user._id  })
        if (!task_by_id) {
            return res.status(404).send("task not found")
        }
        res.send(task_by_id)
    } catch (e) {
        res.status(500)
    }

})


router.patch('/tasks/:id',auth, async (req, res) => {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const validupdate = ['description', 'completed']
    const isValidUpdate = updates.every((update) => validupdate.includes(update))
    if(!isValidUpdate){
        res.status(400).send({error:"invalid updates"})
    }

    try {
       const update_task=await task.findOne({_id,owner:req.valid_user._id})
       

      
        if (!update_task) {
            return res.status(404).send()
        }
        updates.forEach((update)=> update_task[update]=req.body[update])
         // const update_task = await task.findByIdAndUpdate(_id, req.body, { runValidators: true, new: true })

        await update_task.save()
        res.send(update_task)
    } catch (e) {
        res.status(400).send()
    }

})

router.delete('/tasks/:id',auth,async (req,res)=>{
    const _id=req.params.id
  try{
    const delete_task=await task.findOneAndDelete({_id,owner:req.valid_user._id})

    if(!delete_task){
        return res.status(404).send()
    }

    res.send(delete_task)
}catch(e){
    res.status(500).send()
}

})

module.exports=router
