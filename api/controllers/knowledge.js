const mongoose = require('mongoose');

const Knowledge = require('../models/knowledge');

exports.knowledge_create = (req, res, next) => {
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
      createdBy: req.body.createdBy
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
                  url: process.env.DOMAIN + result._id
               }
            }
         });
      })
      .catch(err => {
         console.log(err);
         res.status(500).json({ error: err });
      });
};
