const mongoose = require('mongoose');

const eventSchema = mongoose.Schema(
   {
      _id: mongoose.Schema.Types.ObjectId,
      name: { type: String, required: true },
      description: { type: String, required: true },
      members: [{ type: String }],
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
      eventDate: {type: Date, required: true}
   },
   { timestamps: true },
);

module.exports = mongoose.model("Event", eventSchema);