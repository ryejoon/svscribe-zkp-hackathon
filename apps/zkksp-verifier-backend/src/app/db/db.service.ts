import {Injectable, OnModuleInit} from '@nestjs/common';
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {environment} from "../../environments/environment";
import {BillingMode, DynamoDB, KeyType, ScalarAttributeType} from "@aws-sdk/client-dynamodb";
import {App, AppCreateInput, PaymentPeriod, TokenItem} from "@zkp-hackathon/common";
import {classes} from "@runonbitcoin/nimble";
import PrivateKey = classes.PrivateKey;

const tableName = "zkp-svscribe";

@Injectable()
export class DbService implements OnModuleInit {
  private dbClient: DynamoDB = new DynamoDB({
    region: "us-east-1",
    endpoint: environment.dynamoDbEndpoint
  });
  private docClient: DocumentClient = new DocumentClient({
    region: "us-east-1",
    endpoint: environment.dynamoDbEndpoint
  });

  async onModuleInit() {
    await this.dbClient.createTable({
      TableName: tableName,
      AttributeDefinitions: [{
        AttributeName: "pk",
        AttributeType: ScalarAttributeType.S
      }, {
        AttributeName: "sk",
        AttributeType: ScalarAttributeType.S
      }],
      KeySchema: [{
        AttributeName: "pk",
        KeyType: KeyType.HASH
      },
        {
          AttributeName: "sk",
          KeyType: KeyType.RANGE
        }
      ],
      BillingMode: BillingMode.PAY_PER_REQUEST
    }).catch(err => {
      //
    });
  }

  async insertApp(input: AppCreateInput) {
    const privateKey = PrivateKey.fromRandom();
    const app:App = {
      ...input,
      appId: generateRandomAlphanumeric(10),
      privateKey: privateKey.toString(),
      paymentAddress: privateKey.toAddress().toString()
    }
    app['pk'] = `app#${app.appId}`;
    app['sk'] = app.paymentAddress;

    return this.docClient.put({
      TableName: tableName,
      Item: app
    }).promise().then(() => app);
  }

  async insertPayment(input: PaymentPeriod) {
    const payment: PaymentPeriod = {
      ...input
    };
    payment['pk'] = `pmt#${input.publicKey}`;
    payment['sk'] = input.txid;
    return this.docClient.put({
      TableName: tableName,
      Item: payment
    }).promise().then(() => payment);
  }

  async insertToken(input: TokenItem) {
    const token: TokenItem = {
      ...input
    };
    token['pk'] = `tkn#${token.token}`;
    token['sk'] = token.publicKey;
    return this.docClient.put({
      TableName: tableName,
      Item: token
    }).promise().then(() => token);
  }

  async scanApps() {
    return this.docClient.scan({
      TableName: tableName
    }).promise().then(r => r.Items);
  }

  async queryApp(appId: string): Promise<App> {
    const res = await this.docClient.query({
      TableName: tableName,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": `app#${appId}`
      }
    }).promise();
    const vals = Object.values(res.Items);
    console.log(vals);
    return vals[0] as App;
  }

  async queryTokenItem(token: string): Promise<TokenItem> {
    const res = await this.docClient.query({
      TableName: tableName,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": `tkn#${token}`
      }
    }).promise();
    console.log(res);
    const vals = Object.values(res.Items);
    return vals[0] as TokenItem;
  }

  async queryPaymentPeriods(publicKey: string): Promise<PaymentPeriod[]> {
    const res = await this.docClient.query({
      TableName: tableName,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ':pk': `pmt#${publicKey}` }
    }).promise();
    const vals = Object.values(res.Items);
    return vals as PaymentPeriod[];
  }
}

function generateRandomString(length, chars) {
  let result = '';
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

export function generateRandomAlphanumeric(length = 20) {
  return generateRandomString(length, '0123456789abcdefghijklmnopqrstuvwxyz');
}
