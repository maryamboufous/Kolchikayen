const student = require('../models/studentModel');
const Prof = require('../models/ProfModel');

const userControl = {

    register: async (req,res)=>{
        // console.log(req.body.Type)
        if(req.body.Type=="professor"){
            // console.log("in")
            
                const user = new Prof({
                   name : req.body.Name,
                   mail: req.body.Mail,
                   password: req.body.Password
            })
            await user.save()
            // console.log('created')
            return res.json({ msg: 'prof added successfuly!!', data: user })
        }
        else  if(req.body.Type == "student"){
            const user = new student({
               Name : req.body.Name,
               mail: req.body.Mail,
               password: req.body.Password
        })
        await user.save()
        // console.log('created')
        return res.json({ msg: 'Student added successfuly!!', data: user })
    }



        
    },
        Login :async(req,res)=>{
;
        if(req.body.Type=='professor'){
            await Prof.findOne({mail:req.body.Mail}).then((data)=>{
                if(data.password==req.body.Password){
                    res.send({"Auth":true,data:data})
                    console.log("Auth")
                }
                else{
                    res.send({
                        "Auth":false
                    }) 
                }
            }).catch((e)=>{
                console.log(e)
                
                res.send({
                    "Auth":false
                }) 
            })
        }
        else if(req.body.Type=='student'){
                
                await student.findOne({mail:req.body.Mail}).then((data)=>{
                    console.log('Found')

                    if(data.password==req.body.Password){
                        console.log('Found')
                        res.send({"Auth":true,data:data})
                        // console.log("Auth")
                    }
                    else{
                        res.send({
                            "Auth":false
                        }) 
                    }
                }).catch((e)=>{
                    // console.log(e)
                    res.send({
                        "Auth":false
                    }) 
                })
            
        }   
    }


    

}
module.exports = userControl