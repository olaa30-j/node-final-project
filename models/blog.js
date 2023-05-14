const mongoose = require('mongoose');
const blogSchema=mongoose.Schema({
    title:{
        type:String,      
    },
    description:{
        type:String,
    },
    img:{
        type:String,    
    },
    tags:{
        type:[String],    
    },
    publisher:Object,
    date:Date
},{
strict:false,
versionKey :false,
    
})

const blogs=mongoose.model('blog',blogSchema)

module.exports=blogs;