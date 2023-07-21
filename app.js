const express = require('express');
const app = express();
require("./model/product");
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

        app.use((req,res,next)=> 
        {
            res.header("Access-control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers",
            "Origin, X-Requested-With, content-type, Accept, Authorization");
    
        if(req.method == 'OPTIONS')
         {
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE,GET');
            return res.status(200).json({});
         }
         next();
    });


const productRoutes= require('./routes/products');
const ordersRoutes = require('./routes/orders');
const userRoutes = require('./routes/user');



/* mongoose.connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser : true
}).then(()=>console.log("Connected to database")).catch((err)=> {
    console.log("err", err)
}); */

mongoose.connect('mongodb+srv://node-shop:'+ process.env.mongo_pw +'@node-shop.7xpxuh0.mongodb.net/db?retryWrites=true&w=majority',{
    useUnifiedTopology: true,
    useNewUrlParser : true
}).then(()=>console.log("Connected to database")).catch((err)=> {
    console.log("err", err)
});

mongoose.Promise = global.Promise;


    

    
   

app.use(morgan('dev'));
app.use('/upload',express.static('upload'))
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use('/products', productRoutes);
app.use('/orders', ordersRoutes);
app.use('/user', userRoutes);

app.use((req,res,next)=>{
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
})

app.use((req,res,next)=>{
    res.status(error.status || 500)
    res.json({
        error:
        {
            message:error.message
        } 
    })
})







module.exports =app;