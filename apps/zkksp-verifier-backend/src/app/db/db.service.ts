import {Injectable, OnModuleInit} from '@nestjs/common';
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {environment} from "../../environments/environment";
import {BillingMode, DynamoDB, KeyType, ScalarAttributeType} from "@aws-sdk/client-dynamodb";
import {App, AppCreateInput, PaymentPeriod, TokenItem, Utxo} from "@zkp-hackathon/common";
import {classes} from "@runonbitcoin/nimble";
import PrivateKey = classes.PrivateKey;

const TableName = "zkp-svscribe";

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
    // init db
    await this.dbClient.createTable({
      TableName,
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
    }).then(async r => {
      console.log(`inserting test apps to db`);
      // insert test data
      const appWalletPk = "Kxw1L6m98UmsBADbJzNgXUVQ3z2UnUUQjWe9mzsz26fSV17KSLMb";
      await this.insertApp({
        name: "One Minute App",
        description: "Subscribe for one minute!",
        durationSeconds: 60,
        priceSatoshis: 500,
        privateKey: appWalletPk,
        paymentAddress: PrivateKey.from(appWalletPk).toAddress().toString()
      });
      await this.insertApp({
        name: "One Hour App",
        description: "Subscribe for one hour!",
        durationSeconds: 60 * 60,
        priceSatoshis: 1000,
        privateKey: appWalletPk,
        paymentAddress: PrivateKey.from(appWalletPk).toAddress().toString()
      });
    }).catch(err => {
      console.log(`db already initialized.`);
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
      TableName,
      Item: app
    }).promise().then(() => app);
  }

  async insertPayment(input: PaymentPeriod, spendingUtxo: Utxo) {
    const payment: PaymentPeriod = {
      ...input
    };
    payment['pk'] = `pmt#${input.publicKey}`;
    payment['sk'] = input.txid;
    return this.docClient.transactWrite({
      TransactItems: [
        {
          Put: {
            TableName,
            Item: payment
          }
        },
        {
          Put: {
            TableName,
            Item: {
              pk: `spt#${spendingUtxo.publicKey}`,
              sk: `${spendingUtxo.txid}_${spendingUtxo.outputIdx}`,
              ...spendingUtxo
            }
          }
        }
      ]
    }).promise().then(() => payment);
  }

  async insertToken(input: TokenItem) {
    const token: TokenItem = {
      ...input
    };
    token['pk'] = `tkn#${token.token}`;
    token['sk'] = token.publicKey;
    return this.docClient.put({
      TableName,
      Item: token
    }).promise().then(() => token);
  }

  async scanApps() {
    return this.docClient.scan({
      TableName,
      FilterExpression: "begins_with(pk, :prefix)",
      ExpressionAttributeValues: {
        ':prefix': "app#"
      }
    }).promise().then(r => r.Items);
  }

  async scanTokens(): Promise<TokenItem[]> {
    return this.docClient.scan({
      TableName,
      FilterExpression: "begins_with(pk, :prefix)",
      ExpressionAttributeValues: {
        ':prefix': "tkn#"
      }
    }).promise().then(r => r.Items as TokenItem[]);
  }

  async queryApp(appId: string): Promise<App> {
    const res = await this.docClient.query({
      TableName,
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
      TableName,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": `tkn#${token}`
      }
    }).promise();
    console.log(res);
    const vals = Object.values(res.Items);
    return vals[0] as TokenItem;
  }

  async queryPaymentPeriods(publicKey: string, appId: string): Promise<PaymentPeriod[]> {
    const res = await this.docClient.query({
      TableName,
      KeyConditionExpression: "pk = :pk",
      FilterExpression: "appId = :appId",
      ExpressionAttributeValues: {
        ':pk': `pmt#${publicKey}`,
        ':appId': appId
      }
    }).promise();
    const vals = Object.values(res.Items);
    return vals as PaymentPeriod[];
  }

  async queryUsedUtxos(publicKey: string): Promise<Utxo[]> {
    return this.docClient.query({
      TableName,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ':pk': `spt#${publicKey}` }
    }).promise().then(r => r.Items as Utxo[]);
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
