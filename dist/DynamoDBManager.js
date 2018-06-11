"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
class DynamoDBManager {
    constructor(tableName, region) {
        this.dynamoDb = new aws_sdk_1.DynamoDB.DocumentClient({ region });
        this.tableName = tableName;
    }
    saveData($item) {
        return new Promise((resolve, reject) => {
            this.dynamoDb.put({
                TableName: this.tableName,
                Item: $item,
            }, ($err, $result) => {
                if ($err) {
                    reject($err);
                }
                else {
                    resolve({ statusCode: 200, msg: "dynamoDB put success", result: JSON.stringify($result) });
                }
            });
        });
    }
    getData($id) {
        return new Promise((resolve, reject) => {
            this.dynamoDb.get({
                TableName: this.tableName,
                Key: { id: $id },
            }, ($err, $result) => {
                if ($err) {
                    reject($err);
                }
                else if (!$result.Item) {
                    reject({ statusCode: 400, msg: "data does not exist in dynamoDB" });
                }
                else {
                    resolve({ statusCode: 200, msg: "get data success", result: JSON.stringify($result.Item) });
                }
            });
        });
    }
}
exports.default = DynamoDBManager;
