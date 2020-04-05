const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
   {
      _id: mongoose.Schema.Types.ObjectId,
      email: {
         type: String,
         required: true,
         unique: true,
         match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
      },
      password: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      role: [{ type: String, required: true }],
      address: [
         {
            addressTitle: { type: String, required: false },
            street: { type: String, required: true },
            zipCode: { type: String, required: true },
            city: { type: String, required: true },
            country: { type: String, required: true },
         },
      ],
      mobile: { type: String, required: true },
      phone: { type: String },
      isVerified: { type: Boolean, default: false},
      imageUrl: { type: String },
   },
   { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
