const cgMail=require('@sendgrid/mail')

cgMail.setApiKey(process.env.SENDGRID_API_KEY)

 const sendWelcomeMail=(name,email)=>{
      
    cgMail.send({
        to:email,
        from:'usmanhbtu@gmail.com',
        subject:'Welcome to Task-App',
        text:`hi ${name} welcome to task-app now you can perform task`
    })
 }

 const sendDeleteMail=(name,email)=>{

    cgMail.send({
        to:email,
        from:'usmanhbtu@gmail.com',
        subject:'Account is deleted',
        text:`Hi ${name} Thanks for being with us see you again`

    })

 }


 module.exports={
     sendWelcomeMail,
     sendDeleteMail
 }