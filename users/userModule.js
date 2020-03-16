const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userModule = module.exports = require('../models/user');
const {
  // ErrorTypes,
  // NotAuthorizedError,
  IncorrectCredentialsError } = require('../errrors/errors'); 

//reset password
module.exports.resetPassword = async function(data) {  
  const { email, currentPassword, newPassword} = data;
  try {
    const user = await userModule.findOne({email: email.trim()});
        if(!user) {
            return new IncorrectCredentialsError('Incorrect email');
        }
        const match = await bcrypt.compare(currentPassword.trim(), user.password);
        if(!match) {
            return new IncorrectCredentialsError('Incorrect password');    
        }
    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);

    const result = await userModule.update({email: email.trim()},
      { $set: {
      password: hashedPassword
    }});
    return result;
  }
  catch (err) {
    return err;
  }
};
