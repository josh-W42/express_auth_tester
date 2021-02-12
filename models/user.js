'use strict';
const crypto = require('crypto');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  user.init({
    name: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [1,99],
          msg: "Name must be between 1 and 99 characters",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: {
          args: true,
          msg: 'Invalid Email',
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [8,99],
          msg: "Password must be between 8 and 88 characters",
        },
      },
      get() {
        return () => this.getDataValue('password');
      },
    },
    salt: {
      type: DataTypes.STRING,
      get() {
        return () => this.getDataValue('salt');
      },
    },
  }, {
    sequelize,
    modelName: 'user',
  });
  
  // So in this version of creating a hash, as opposed to
  // bcrypt, this using the built-in module crypto to hash text.
  const encryptPassword = function(plainText, salt) {
    return crypto
    .createHash('RSA-SHA256')
    .update(plainText)
    .update(salt)
    .digest('hex')
  }
  
  user.generateSalt = function() {
    return crypto.randomBytes(16).toString('base64');
  }

  user.prototype.validPassword = function(typedPassword) {
    return encryptPassword(typedPassword, this.salt()) === this.password();
  }
  
  const setSaltAndPassword = User => {
    if (User.changed('password')) {
      User.salt = user.generateSalt();
      User.password = encryptPassword(User.password(), User.salt());
    }
  }
  
  user.addHook('beforeCreate', user => setSaltAndPassword(user));
  user.addHook('beforeUpdate', user => setSaltAndPassword(user));
  
  // May not need because of get methods
  // user.toJSON = function() {
  //   let userData = this.get();
  //   delete userData.password;
  //   delete userData.salt;
  //   return userData;
  // }

  
  return user;
};