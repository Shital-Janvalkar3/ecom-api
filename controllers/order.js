const Order = require("../model/orders");

exports.orders_get_all =  (req,res,next)=> {
    Order.find()
    .select('product quantity _id')
    .populate('product','name')
    .then((docs)=> {
      console.log(docs);
      res.status(200).json({
        count: docs.length,
        orders : docs.map((doc)=>{
        return {
          _id : doc._id,
          product: doc.product,
          quantity : doc.quantity,
          type : {
            request: 'GET',
            url : 'http://localhost:3000/orders/' + doc.id
          }
        }
        })
      });
    })
    .catch((err)=> {
      console.log(err);
      res.status(200).json({
        error: err
      })
     
         
    })
  }