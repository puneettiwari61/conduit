var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var  bcrypt = require('bcryptjs');

var userSchema = new Schema({
  username: {type: String, lowercase: true, unique: true, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  bio: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default:''
  },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

userSchema.pre('save', async function(next){
  if(this.password && this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10)
    next()
  }
  next();
})

userSchema.methods.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.password)
}


module.exports = mongoose.model('User',userSchema)