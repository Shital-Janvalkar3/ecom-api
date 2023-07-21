const express = require("express");
const router = express.Router();
const Product = require("../model/product");
const mongoose = require("mongoose");
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

/*const storage = multer.diskStorage({
  destination: function( req, file, cb) {
   cb(null, "upload/")
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}--${file.originalname}`);
  },
});*/

const storage = multer.diskStorage({ //multers disk storage settings
  destination: function (req, file, cb) {
      cb(null, 'upload/')
  },
  filename: function (req, file, cb) {
      var datetimestamp = Date.now();
      cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
  }
});




/*const fileFilter =( req, file, cb) =>  {
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null,true);
  }
  else {
    cb(null, false);
  }
 }*/

 const fileFilter =function (req, file, callback) {
  var ext = path.extname(file.originalname);
  if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      return callback(new Error('Only images are allowed'))
  }
  callback(null, true)
}

const upload = multer({storage: storage, 
  limits: {
  fileSize :1024 * 1024 * 5,
  fileFilter: fileFilter,
  }})

    
   





router.get("/", (req, res, next) => {
  Product.find()
  .select('name price _id productImage')
    .exec()
    .then((docs) => {
      const response = {
        count : docs.length,
        product : docs.map(doc => {
          return {
            name : doc.name,
            price : doc.price,
            _id : doc._id,
            productImage: doc.productImage,
            request: {
              type: 'GET',
              url :'http://localhost:3000/products/' + doc._id 
             }
          
          }
        })
      }
       res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json({
        error: err,
      });
    });
});




router.post("/", checkAuth,upload.single("productImage"), (req, res, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path,
  });
  product.save()
  .then((result) => {
    console.log(result);
    res.status(201).json({
        message: "update data",
        createdProduct: {
          name: result.name,
          price: result.price,
          _id: result._id,
          productImage: result.productImage,
          request: {
            type: "GET",
            url: "http://localhost:3000/products/" + result._id,
          },
        }
      })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
  });

 
 

      
      
  router.get("/:productId", checkAuth, (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
  .select('name price _id')
    .exec()
    .then((doc) => {
      console.log("from Database", doc);
      res.status(200).json({ findById : {
        name : doc.name,
        price: doc.price,
        id: doc._id,
        productImage: doc.productImage,
        request : {
          method: 'GET',
          url : 'http://localhost:3000/products/' + doc._id
        }
      }
      })
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: err });
      });
  });
       



    

   
  


router.patch("/:productId", (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};
  for( const ops of req.body) {
      updateOps[ops.propName] = ops.value;
      }
    Product.updateOne({ _id : id}, { $set : updateOps}).exec().then(result => {
    res.status(200).json({
      message : 'updated data successfully',
      request : {
        type : 'GET',
        url : 'http://localhost:3000/products/'+ id
}
    }) 
  
  })
      .catch(err => { console.log(err); res.status(404).json({ error: err})})
  });

router.delete("/:productId",checkAuth, (req, res, next) => {
  const id = req.params.productId;
  Product.deleteOne({ _id : id })
  .exec()
  .then(result=> {
    console.log(result);
    res.status(200).json({
      message: 'Product deleted',
      request: 'POST',
      url: 'http;//localhost:3000//products',
      body: { name: 'String', price: 'Number'}
    });
  })
  .catch(err => { console.log(err)
  res.status(404).json({ error:err})});

  
});

module.exports = router;