var express  = require('express');
var router = express.Router();
var Article = require('../../models/article')
var Comment = require('../../models/comment')
var auth = require('../../modules/auth')
var User = require('../../models/user')
var slug = require('slug')
var url = require('url')



// List articles
router.get('/',auth.verifyToken, async function(req,res){
  try{
  // var search = url.parse(req.url,true).query
  var searchResult = await Article.find(url.parse(req.url,true).query).sort({"createdAt": -1})
  res.json({searchResult})
  } catch(error){
    res.status(400).json(error)
  }
})


//get feed
router.get('/feed',auth.verifyToken, async function(req,res) {
  try {
    var currentUser = await User.findOne({"_id" : req.user.userID})
    await Article.find({"author":{ $in: currentUser.following}}).sort({"createdAt": -1}).limit(20).exec((err,feed)=>{
      if(err) return next(err)
      res.json({feed})
    })
  }
  catch(error) {
    res.status(400).json(error)
  }
})




//read one article
router.get('/:slug', async function(req,res){
 try {
   var article = await Article.findOne({slug: req.params.slug})
   if(!article) return res.status(400).json({error: 'slug or article dosent exist'})
   res.json({ article })
  } catch(error) {
    res.status(400).json(error)    
  } 
})

//create article
router.post('/',auth.verifyToken, async function(req,res){
  try {
    req.body.author = req.user.userID
    var newArticle = await Article.create(req.body)
    var article = await Article.findById(newArticle.id).populate('author',['bio','username','image'])
    var currentUser = await User.findById(req.user.userID)
    article["favorited"] = await currentUser.favorites.includes(article.id)
    // console.log(article)
    res.json({article})
   } catch(error) {
     res.status(400).json(error)    
   } 
 })


 //update article 
 router.put('/:slug',auth.verifyToken, async function(req,res){
  try {
    if(req.body.title){
      req.body.slug = await slug(req.body.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
    }
    // req.body.slug = await slug(req.body.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36)
    var article = await Article.findOneAndUpdate({slug: req.params.slug},req.body,{new:true})
    // console.log(article)
    if(!article) return res.status(400).json({error: 'slug or article dosent exist'})
    res.json({ article })
   } catch(error) {
     res.status(400).json(error)    
   } 
 })




//delete article
router.delete('/:slug',auth.verifyToken, async function(req,res){
 try {
   var article = await Article.findOneAndRemove({slug: req.params.slug})
   if(!article) return res.status(400).json({error: 'slug or article dosent exist'})
   res.json({ 'this is deleted ' : article })
  } catch(error) {
    res.status(400).json(error)    
  } 
})


//create comments 
router.post('/:slug/comments',auth.verifyToken, async function(req,res){
  try {
    var article = await Article.findOne({slug: req.params.slug})
    if(!article) return res.status(400).json({error: 'slug or article dosent exist'})
    req.body.article = article._id
    req.body.author = req.user.userID
    // console.log(req.body.article.id)
    var comment = await Comment.create(req.body)
    await Article.findOneAndUpdate({slug: req.params.slug},{$push: {"comments":comment._id}})
    res.json({'successfully added': comment})
   } catch(error) {
    //  console.log(error)
     res.status(400).json(error)    
   } 
 })


 //get comments
 router.get('/:slug/comments',auth.verifyToken, async function(req,res){
  try{
    var article = await Article.findOne({slug: req.params.slug}).populate('comments')
    if(!article) return res.status(400).json({error: 'slug or article dosent exist'})
    // var comments = await article.populate('comments')
    // if(comments.length === 0) return res.json({comments:null})
    res.json({comments: article.comments})
  }
  catch(error){
    res.status(400).json(error)    
  }
 })


 //delete comments
 router.delete('/:slug/comments/:id',auth.verifyToken, async function(req,res){
  try {
    var removedComment = await Comment.findByIdAndRemove(req.params.id)
    if(!removedComment) return res.status(400).json({error: 'comments doesn\'t exist'})
    res.json({comment:'comment removed'})
  }
  catch(error){
    res.status(400).json(error)
  }
 })



 //favourite article
 router.post('/:slug/favorite',auth.verifyToken, async function(req,res){
   try {
     var article = await Article.findOne({slug:req.params.slug}).populate('author',['bio','username','image'])
     var user = await User.findByIdAndUpdate(req.user.userID, { $push: { favorites: article._id} })
     res.json({ article })
   }
   catch(error){
    res.status(400).json(error)
  }
 })


 //unfavourite article
 router.delete('/:slug/favorite',auth.verifyToken, async function(req,res){
  try {
    var article = await Article.findOne({slug:req.params.slug}).populate('author',['bio','username','image'])
    var user = await User.findByIdAndUpdate(req.user.userID, { $pull: { favorites: article._id} })
    res.json({ article })
  }
  catch(error){
   res.status(400).json(error)
 }
})

//PENDING WORK

//feed articles

// router.get('/feed',auth.verifyToken, async function(req,res){
//   try{
//     // var articles = await Article.find({}) 
//     // var article = await Article.findOne({slug: req.params.slug}).populate('comments')
//     var user = await User.findById(req.user.userID)
//     user.following. map(id => {
//       Article.find({"author": id})
//     })

//   }catch(error){
//     res.status(400).json(error)
//   }
// Article .find({
//   author:{
//     $in: req.user.following
//   }
// })
// })





 

module.exports = router