const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require("../model/orders")
const Product = require("../model/product");
const checkAuth = require('../middleware/check-auth')
const orderController = require('../controllers/order');

router.get('/',checkAuth, orderController.orders_get_all);
  

router.post("/",checkAuth, (req, res, next) => {
  Product.findById(req.body.productId)
  .then(product => {
    if (!product) {
      return res.status(404).json({
        message: 'product not found',
      });
    }
const order = new Order({
      _id: new mongoose.Types.ObjectId(),
      quantity: req.body.quantity,
      product: req.body.productId,
    });
    return order.save()
  })
      .then(result => {
        console.log(result);
        res.status(201).json({
          message: "order created successfully",
          createdOrder: {
            _id: result._id,
            product: result.product,
            quantity: result.quantity,
          },
          request: {
            type: 'GET',
            url: 'http://localhost:3000/orders/'+ result.id,
        },
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
        error : err
        });
      });
  });


   
  
      

router.get('/:orderId',checkAuth, (req, res, next) => {
  Order.findById(req.params.orderId)
  .populate('product')
  .exec()
  .then((order)=> {
    if(!order) 
    return res.status(404).json({
      message: 'order not found'
    })
    res.status(200).json({
      order: order,
      type : {
        request: 'GET',
        url: 'http://localhost:3000/orders'
      }
    })
  })
  .catch(err=>{res.status(500).json({
    error: err})
  
  })
  
});




router.delete('/:orderId',checkAuth, (req,res,next)=> {
  Order.deleteOne({_id :req.params.orderId })
  .exec()
  .then((result)=>{
    res.status(200).json({
      message : 'Deleted order',
      request : {
        type: 'POST',
        url : 'http://localhost:3000/orders',
        body: { productId: "ID", quantity: "Number"}
      }
    })
  })
  

})

module.exports = router;
