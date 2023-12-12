import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

export const lambdaHandler = async (event, context) => {
    try {
        const userId = event.queryStringParameters.userId
        const headers = {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Origin": "*", // this will be the site url
            "Access-Control-Allow-Methods": "*",
            "X-Requested-With": "*"
        };
        const s3Client = new S3Client({})
        const bucketName = 'photo-app-api-photosbucket-xc1en19z1ai';
        const key = 'file.txt'; 
        const data = `This is the userId: ${userId}`;

        const command = new PutObjectCommand({
            Bucket: bucketName, 
            Key: key,
            Body: data
          });
          
        const response = await s3Client.send(command);
        
        console.log(response)

        return {
            'statusCode': 200,
            headers,
            'body': JSON.stringify({
                message: `Photo succesfully uploaded for ${userId}`,
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }
};
