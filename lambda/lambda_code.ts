/*
1. Receive request from API Gateway
2. Read id, name, description, category
3. Connect to DynamoDB
4. Store the data into the DynamoDB StudentItems table
*/

// Import DynamoDB
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand
} from "@aws-sdk/lib-dynamodb";


// Create DynamoDB client connection
const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);


// Get DynamoDB table name
const TABLE_NAME = process.env.TABLE_NAME!;


// Lambda function
export const handler = async (event: any) => {

  // Read data from API Gateway
  const body = JSON.parse(event.body);


  // Create the item
  const item = {
    id: body.id,
    name: body.name,
    description: body.description,
    category: body.category
  };


  // Insert data into DynamoDB
  await dynamodb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    })
  );


  // Return successful response
  return {
    statusCode: 201,
    body: JSON.stringify(item)
  };

};