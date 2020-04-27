const mongoose = require('mongoose');

const Knowledge = require('../models/knowledge');
const User = require('../models/user');

exports.knowledge_create = (req, res, next) => {
   // first find user Id
   User.findOne({ email: req.body.createdBy })
      .select(
         "_id"
      )
      .exec()
      .then(user => {
         if (user) {
            const knowledge = new Knowledge({
               _id: new mongoose.Types.ObjectId(),
               title: req.body.title,
               description: req.body.description,
               type: req.body.type,
               affiliation: req.body.affiliation,
               status: req.body.status,
               lookingFor: req.body.lookingFor,
               members: req.body.members,
               knowledgeFile: req.body.knowledgeFile,
               knowledgeFileType: req.body.knowledgeFileType,
               createdBy: user._id,
               comments: [],
               likes: []
            });
            knowledge
               .save()
               .then(result => {
                  console.log(result);
                  res.status(201).json({
                     message: "Knowledge created",
                     createdKnowledge: {
                        title: result.title,
                        _id: result._id,
                        request: {
                           type: "GET",
                           url: process.env.BaseApiURL + "/knowledge/" + result._id
                        }
                     }
                  });
               })
               .catch(err => {
                  console.log(err);
                  res.status(500).json({ error: err });
               });
         } else {
            res.status(500).json({ error: 'User not exist.' });
         }
      })
      .catch(err => {
         console.log(err);
         res.status(500).json({ error: err });
      });
};

exports.knowledge_find_by_id = (req, res, next) => {
   const id = req.params.knowledgeId;
   Knowledge.findById(id)
      .select(
         "_id title description type affiliation status lookingFor members knowledgeFile knowledgeFileType createdBy comments likes createdAt updatedAt"
      )
      .exec()
      .then(doc => {
         console.log(doc);
         if (doc) {
            res.status(200).json({
               knowledge: doc,
               request: {
                  type: "GET",
                  url: process.env.BaseApiURL + "/knowledge"
               }
            });
         } else {
            res.status(404).json({
               error: "No valid entry found for provided Id"
            });
         }
      })
      .catch(err => {
         console.log(err);
         res.status(500).json({ error: err });
      });
};

exports.knowledge_get_all = (req, res, next) => {
   Knowledge.find()
      .sort({createdAt: -1})
      .select(
         "_id title description type affiliation status lookingFor members knowledgeFile knowledgeFileType createdBy comments likes createdAt updatedAt"
      )
      .exec()
      .then(docs => {
         const data = {
            count: docs.length,
            knowledge: docs.map(doc => {
               return {
                  _id: doc._id,
                  title: doc.title,
                  description: doc.description,
                  type: doc.type,
                  affiliation: doc.affiliation,
                  status: doc.status,
                  lookingFor: doc.lookingFor,
                  members: doc.members,
                  knowledgeFile: doc.knowledgeFile,
                  knowledgeFileType: doc.knowledgeFileType,
                  createdBy: doc.createdBy,
                  comments: doc.comments,
                  likes: doc.likes,
                  createdAt: doc.createdAt,
                  updatedAt: doc.updatedAt,
                  // request: {
                  //    type: "GET",
                  //    url: process.env.BaseApiURL + "/knowledge/" + doc._id
                  // }
               };
            })
         };
         res.status(200).json(data);
      })
      .catch(err => {
         console.log(err);
         res.status(500).json({ error: err });
      });
};

exports.knowledge_update = (req, res, next) => {
   const id = req.params.knowledgeId;
   Knowledge.update({ _id: id }, { $set: req.body })
      .exec()
      .then(result => {
         console.log(result);
         res.status(200).json({
            message: "Knowledge updated",
            request: {
               type: "GET",
               url: process.env.BaseApiURL + "/knowledge/" + id
            }
         });
      })
      .catch(err => {
         console.log(err);
         res.status(500).json({ error: err });
      });
};

exports.knowledge_delete = (req, res, next) => {
   const id = req.params.knowledgeId;
   Knowledge.remove({ _id: id })
      .then(result => {
         // console.log(result);
         res.status(200).json({
            message: "Knowledge deleted"
         });
      })
      .catch(err => {
         console.log(err);
         res.status(500).json({ error: err });
      });
};

exports.knowledge_comment = (req, res, next) => {
   const id = req.params.knowledgeId;
   Knowledge.findByIdAndUpdate(
      {_id: id},
      {$push: {"comments": {details: req.body.details, userId: req.body.userId, postedOn: req.body.postedOn}}},
      {safe: true, upsert: true, new : true},
      function(err, result) {
         if (err) {
            console.log(err);
            res.status(500).json({ error: err });
         } else {
            res.status(200).json({
               message: "Comment added.",
               data: result
            });
         }
      }
   );
};

exports.knowledge_like = (req, res, next) => {
   const id = req.params.knowledgeId;
   Knowledge.findByIdAndUpdate(
      {_id: id},
      {$push: {"likes": {userId: req.body.userId, likedOn: req.body.likedOn}}},
      {safe: true, upsert: true, new : true},
      function(err, result) {
         if (err) {
            console.log(err);
            res.status(500).json({ error: err });
         } else {
            res.status(200).json({
               message: "Knowledge Liked.",
               data: result
            });
         }
      }
   );
};
