var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var slug = require('slug');
articleSchema = new Schema({
  slug:{
    type:String,
    default: ''
  },
  title:{
    type:String,
    required: true
  },  
  description:{
    type:String,
    required: true
  },
  body:{
    type:String,
    required: true
  },
  tagList:[{
    type: String
  }],
  favorited:{
    type: Boolean
  },
  favoritesCount:{
    type: Number
  },
  favoritesCount:{
    type: Number, 
    default: 0
  },
  author:{
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  comments:[{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }]
}, { timestamps: true })


articleSchema.pre('save', async function(next){
  // if(this.title || this.isModified('title')){
  this.slug = await slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
  console.log(this.slug)
  next()
  // }
})

// articleSchema.pre('updateOne', async function(next){
//   // if(this.title || this.isModified('title')){
//   this.slug = await slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
//   console.log(this.slug)
//   next()
//   // }
// })

articleSchema.pre('find', function() {
  console.log(this instanceof mongoose.Query); // true
  // this.start = Date.now();
});



module.exports = mongoose.model('Article', articleSchema)


