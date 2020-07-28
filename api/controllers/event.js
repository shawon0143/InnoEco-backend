const mongoose = require('mongoose');

const Event = require('../models/event');
const User = require('../models/user');

exports.event_create = (req, res, next) => {
   // first find user Id
   User.findOne({ email: req.body.createdBy })
      .select(
         "_id"
      )
      .exec()
      .then(user => {
         if (user) {
            const event = new Event({
               _id: new mongoose.Types.ObjectId(),
               name: req.body.name,
               description: req.body.description,
               members: req.body.members,
               createdBy: user._id,
               eventDate: req.body.eventDate
            });
            event
               .save()
               .then(result => {
                  console.log(result);
                  res.status(201).json({
                     message: "Event created",
                     createdEvent: {
                        name: result.name,
                        _id: result._id,
                        request: {
                           type: "GET",
                           url: process.env.BaseApiURL + "/event/" + result._id
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


exports.event_find_by_id = (req, res, next) => {
   const id = req.params.eventId;
   Event.findById(id)
      .select(
         "_id name description members createdBy eventDate createdAt updatedAt"
      )
      .exec()
      .then(doc => {
         console.log(doc);
         if (doc) {
            res.status(200).json({
               event: doc,
               request: {
                  type: "GET",
                  url: process.env.BaseApiURL + "/event"
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


exports.event_get_all = (req, res, next) => {
   Event.find()
      .sort({eventDate: 1})
      .select(
         "_id name description members createdBy eventDate createdAt updatedAt"
      )
      .exec()
      .then(docs => {
         const data = {
            count: docs.length,
            events: docs.map(doc => {
               return {
                  _id: doc._id,
                  name: doc.name,
                  description: doc.description,
                  members: doc.members,
                  eventDate: doc.eventDate,
                  createdBy: doc.createdBy,
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

exports.event_register = (req, res, next) => {
   const id = req.params.eventId;

   Event.findByIdAndUpdate(
      {_id: id},
      {$push: {"members": req.body.email}},
      {safe: true, upsert: true, new : true, useFindAndModify: false},
      function(err, result) {
         if (err) {
            console.log(err);
            res.status(500).json({ error: err });
         } else {
            res.status(200).json({
               message: "Event registered.",
               data: result
            });
         }
      }
   );
};
