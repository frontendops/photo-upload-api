
// A simple token-based authorizer example to demonstrate how to use an authorization token 
// to allow or deny a request. In this example, the caller named 'user' is allowed to invoke 
// a request if the client-supplied token value is 'allow'. The caller is not allowed to invoke 
// the request if the token value is 'deny'. If the token value is 'unauthorized' or an empty
// string, the authorizer function returns an HTTP 401 status code. For any other token value, 
// the authorizer returns an HTTP 500 status code. 
// Note that token values are case-sensitive.
import axios from 'axios';

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

export const handler = async function(event, context, callback) {
    var token = event.authorizationToken;

    const secretsManagerRequest = {
        headers: {
            'X-Aws-Parameters-Secrets-Token': process.env.AWS_SESSION_TOKEN
        },
    };

    try {
        const secretRequest = await axios.get('http://localhost:2773/secretsmanager/get?secretId=prod%2Fphoto-app', secretsManagerRequest)
        const data = secretRequest.data
        const secretValue = JSON.parse(data.SecretString).authorizationToken

        switch (token) {
            case secretValue:
                callback(null, generatePolicy('user', 'Allow', event.methodArn));
                break;
            case 'deny':
                callback(null, generatePolicy('user', 'Deny', event.methodArn));
                break;
            case 'unauthorized':
                callback("Unauthorized");   // Return a 401 Unauthorized response
                break;
            default:
                callback("Error: Invalid token"); // Return a 500 Invalid token response
        }
      } catch (error) {
        console.error(`Error: ${error.message}`);
      }

};

// Help function to generate an IAM policy
var generatePolicy = function(principalId, effect, resource) {
    var authResponse = {};
    
    authResponse.principalId = principalId;
    if (effect && resource) {
        var policyDocument = {};
        policyDocument.Version = '2012-10-17'; 
        policyDocument.Statement = [];
        var statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; 
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    
    // Optional output with custom properties of the String, Number or Boolean type.
    authResponse.context = { };
    return authResponse;
}