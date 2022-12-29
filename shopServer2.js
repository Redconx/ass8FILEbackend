let express = require("express");
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,OPTIONS,PUT,PATCH,DELETE,HEAD"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

var port = process.env.PORT||2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));


let {shops,products,purchases}=require("./shopData copy")

app.get("/shops",function(req,res){
 res.send(shops)
})
app.get("/products",function(req,res){
 res.send(products)
})
app.get("/purchases",function(req,res){

  let arr1=purchases.map(ele=>{
    let index=shops.findIndex(sh=>sh.shopid===ele.shopid)
    if(index>=0){
      return {...ele,name:shops[index].name}
    }
  })

  let arr=arr1.map(ele=>{
    let index=products.findIndex(sh=>sh.productid===ele.productid)
    if(index>=0){
      return {...ele,productname:products[index].productname}
    }
  })
 res.send(arr)
})
app.post("/shops",function(req,res){
  let body=req.body    
      let maxid=shops.reduce((acc,crr)=>crr.shopid >= acc ? crr.shopid:acc,0)
      let shopid=maxid+1
      let obj={shopid,...body}
      shops.push(obj)
      res.send(obj)
})
app.post("/products",function(req,res){
  let body=req.body
  let maxid=products.reduce((acc,crr)=>crr.productid >= acc ? crr.productid:acc,0)
  let productid=maxid+1
  let obj={productid,...body}
  products.push(obj)
  res.send(obj)
})
app.put("/products/:id",function(req,res){
  let body=req.body
  let id=+req.params.id
  let index=products.findIndex(ele=>ele.productid===id)
  console.log(index,body);
  products[index]=body
  res.send(products)
})

app.get("/purchases/shops/:id",function(req,res){
  let id=+req.params.id
 let arr=purchases.filter(ele=>ele.shopid===id)
 res.send(arr)
})
app.get("/purchases/products/:id",function(req,res){
  let id=+req.params.id
  let arr=purchases.filter(ele=>ele.productid===id)
  res.send(arr)
})
app.get("/purchases/qp",function(req,res){
  let shop=+req.query.storeid
  let product=req.query.productid
  let sort=req.query.orderby
      let arr1=purchases.map(ele=>{
        let index=shops.findIndex(sh=>sh.shopid===ele.shopid)
        if(index>=0){
          return {...ele,name:shops[index].name}
        }
      })

      let arr=arr1.map(ele=>{
        let index=products.findIndex(sh=>sh.productid===ele.productid)
        if(index>=0){
          return {...ele,productname:products[index].productname}
        }
      })
      if(product) {
        product=product.split(",")
        arr=arr.filter(ele=>product.findIndex(sh=>sh==ele.productid)>=0)
      }
      if(shop) arr=arr.filter(ele=>ele.shopid===shop)
      if(sort==="QtyAsc") arr.sort((j1,j2)=>j1.quantity-j2.quantity)
      if(sort==="QtyDesc") arr.sort((j1,j2)=>j2.quantity-j1.quantity)
      if(sort==="ValueAsc") arr.sort((j1,j2)=>(j1.quantity*j1.price)-(j2.quantity*j2.price))
      if(sort==="ValueDesc") arr.sort((j1,j2)=>(j2.quantity*j2.price)-(j1.quantity*j1.price))
      res.send(arr)
  
})

app.get("/totalPurchase/shop/:id",function(req,res){
  let id=+req.params.id
  console.log(id);
  let arr=purchases.filter(ele=>ele.shopid===id)
  arr=arr.map(ele=>{
    let sum=arr.reduce((acc,crr)=>crr.productid===ele.productid ? acc+crr.quantity:acc,0)
    return {shopid:ele.shopid,productid:ele.productid,total:sum}
  })
  arr=arr.reduce((acc,crr)=>acc.findIndex(el=>el.productid===crr.productid)>=0 ? acc:[...acc,crr],[])
  console.log(arr);
  res.send(arr)
})

app.get("/totalPurchase/product/:id",function(req,res){
  let id=+req.params.id
  let arr=purchases.filter(ele=>ele.productid===id)
  arr=arr.map(ele=>{
    let sum=arr.reduce((acc,crr)=>crr.shopid===ele.shopid ? acc+crr.quantity:acc,0)
    return {shopid:ele.shopid,productid:ele.productid,total:sum}
  })
  arr=arr.reduce((acc,crr)=>acc.findIndex(el=>el.shopid===crr.shopid)>=0 ? acc:[...acc,crr],[])
  console.log(arr);
  res.send(arr)
  
})

app.post("/purchases",function(req,res){
  let body=req.body
  let maxid=purchases.reduce((acc,crr)=>crr.purchaseId >= acc ? crr.purchaseId:acc,0)
  let newPurchaseId=maxid+1
  let arr=[newPurchaseId,body.shopid,body.productid,body.quantity,body.price]
  let sql="INSERT INTO purchases VALUES ($1,$2,$3,$4,$5)"
  client.query(sql,arr,function(err,result){
    if(err)console.log(err.message);
    else{
      res.send(result.rows)
    }
  })
})