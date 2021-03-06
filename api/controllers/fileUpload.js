const aws = require('aws-sdk');

// Configure aws with your accessKeyId and your secretAccessKey
aws.config.update({
   region: 'eu-central-1', // Put your aws region here
   accessKeyId: process.env.AWSAccessKeyId,
   secretAccessKey: process.env.AWSSecretKey,
});

const S3_BUCKET = process.env.Bucket;

// Now lets export this function so we can call it from somewhere else
exports.sign_s3 = (req, res) => {
   const s3 = new aws.S3(); // Create a new instance of S3
   const fileName = req.body.fileName;
   const fileType = req.body.fileType;
   // Set up the payload of what we are sending to the S3 api
   const s3Params = {
      Bucket: S3_BUCKET,
      Key: fileName,
      Expires: 500,
      ContentType: fileType,
      ACL: 'public-read',
   };
   // Make a request to the S3 API to get a signed URL which we can use to upload our file
   s3.getSignedUrl('putObject', s3Params, (err, data) => {
      if (err) {
         console.log(err);
         res.status(500).json({ success: false, error: err });
      }
      // Data payload of what we are sending back, the url of the signedRequest
      // and a URL where we can access the content after its saved.
      const returnData = {
         signedRequest: data,
         url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`,
      };
      // Send it all back
      res.status(200).json({ success: true, data: { returnData } });
   });
};

exports.s3_delete_object = (req, res, next) => {
   const s3 = new aws.S3(); // Create a new instance of S3
   const fileName = req.params.fileName;
   const s3Params = {
      Bucket: S3_BUCKET,
      Key: fileName
   };
   s3.deleteObject(s3Params, (err, data) => {
      if (err) {
         console.log(err);
         res.status(500).json({ success: false, error: err });
      }
      res.status(200).json({ success: true, message: fileName + ' deleted' });
   })
};
