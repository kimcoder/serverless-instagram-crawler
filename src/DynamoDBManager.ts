import { DynamoDB } from "aws-sdk";

export default class DynamoDBManager {
    dynamoDb: DynamoDB.DocumentClient;
    tableName: string;

    constructor(tableName: string, region: string) {
        this.dynamoDb = new DynamoDB.DocumentClient({ region });
        this.tableName = tableName;
    }
    
    saveData($item: any) {
        return new Promise((resolve, reject) => {
            this.dynamoDb.put({
                TableName: this.tableName,
                Item: $item,
            }, ($err, $result) => {
                // console.log("[DynamoDBManager saveData] response");
                // console.log($err, $result);
                if ($err) {
                    reject($err);
                } else {
                    resolve({ statusCode: 200, msg: "dynamoDB put success", result: JSON.stringify($result) });
                }
            });
        });
    }
    
    getData($id: string) {
        return new Promise((resolve, reject) => {
            this.dynamoDb.get({
                TableName: this.tableName,
                Key: { id: $id },
            }, ($err, $result) => {
                // console.log("[DynamoDBManager getData] response");
                // console.log($err, $result);
                if ($err) {
                    reject($err);
                } else if (!$result.Item) {
                    reject({ statusCode: 400, msg: "data does not exist in dynamoDB" });
                } else {
                    resolve({ statusCode: 200, msg: "get data success", result: JSON.stringify($result.Item) });
                }
            });
        });
    }
}
