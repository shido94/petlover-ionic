const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var requestSchema = new Schema({
  delivery_date: {
    type: Date,
    required: true
  },
  delivery_time: {
    type: Date,
  },
  to: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  created_on: {
    type: Date,
    default: Date.now
  },
  truck_category_required: {
    type: String,
  },
  price: {
    type: String
  },
  move_type: {
    type: String
  },
  no_of_helpers_req: {
    type: Number
  },
  img: {
    data: Buffer,
    contentType: String
  },
  filename: {
    type: String,
    required: true
  },
  originalname: {
    type: String,
    required: true
  },
  path: {
    type: String
  }
});

const Request = module.exports = mongoose.model('requests', requestSchema);

module.exports.addRequest = async (newRequest) => {
  try {
    const request = new Request(newRequest);
    return request.save();
  } catch (error) {
    return error;
  }
};
