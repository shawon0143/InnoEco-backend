const mongoose = require('mongoose');

const knowledgeSchema = mongoose.Schema(
   {
      _id: mongoose.Schema.Types.ObjectId,
      title: { type: String, required: true },
      description: { type: String, required: true },
      type: { type: String, required: true },
      affiliation: [{ type: String }],
      status: { type: String, required: true },
      lookingFor: [{ type: String }],
      members: [{ type: String }],
      knowledgeFile: { type: String },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
      comments: [
         {
            details: { type: String, required: true },
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
            postedOn: { type: Date, required: true }
         }
      ]
   },
   { timestamps: true },
);

module.exports = mongoose.model("Knowledge", knowledgeSchema);
