/*
AWS CDK Serverless Project

1. Create DynamoDB Table
2. Create Lambda Function
3. Connect Lambda to DynamoDB
4. Give Lambda permission to access DynamoDB
*/

// Import AWS CDK
import * as cdk from 'aws-cdk-lib';

// Import Construct
import { Construct } from 'constructs';

// Import DynamoDB
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

// Import Lambda
import * as lambda from 'aws-cdk-lib/aws-lambda';

// Import apigateway
import * as apigateway from 'aws-cdk-lib/aws-apigateway';


export class ServerlessCdkProjectStack extends cdk.Stack {

  constructor(
    scope: Construct,
    id: string,
    props?: cdk.StackProps
  ) {

    super(scope, id, props);


    /*
    --------------------------------
    1. Create DynamoDB Table
    --------------------------------
    */

    const table = new dynamodb.Table(
      this,
      'StudentItemsTable',
      {

        // DynamoDB table name
        tableName: 'StudentItems',

        // Primary key
        partitionKey: {
          name: 'id',
          type: dynamodb.AttributeType.STRING
        },

        // Pay only for requests used
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,

        // Delete table when CDK stack is deleted
        removalPolicy: cdk.RemovalPolicy.DESTROY

      }
    );


    /*
    --------------------------------
    2. Create Lambda Function
    https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda-readme.html
    --------------------------------
    */

    const itemsFunction = new lambda.Function(
      this,
      'ItemsFunction',
      {

        // Node.js runtime
        runtime: lambda.Runtime.NODEJS_20_X,

        // x86_64 architecture
        architecture: lambda.Architecture.X86_64,

        // Lambda memory
        memorySize: 256,

        // Lambda timeout
        timeout: cdk.Duration.seconds(10),

        // items.ts contains:
        // export const handler
        handler: 'items.handler',

        // Lambda source code location
        code: lambda.Code.fromAsset('lambda'),

        // Pass DynamoDB table name to Lambda
        environment: {

          TABLE_NAME: table.tableName

        }

      }
    );

    /*
    --------------------------------
    3. Give Lambda Permission
       to access DynamoDB
    --------------------------------
    */

    table.grantReadWriteData(itemsFunction);

    /*
      4. Create API Gateway
    */

    const api = new apigateway.RestApi(
      this,
      'StudentItemsApi',
      {
        restApiName: 'Student Items API',
        description: 'REST API for StudentItems'
      }
    );

    /* 5. Create /items resource */
    const items = api.root.addResource('items');

    /* 6. Connect API Gateway to Lambda */
    const lambdaIntegration = new apigateway.LambdaIntegration(itemsFunction);

    items.addMethod('GET', lambdaIntegration);

    // POST /items
    items.addMethod('POST', lambdaIntegration);
  }
}

