import { APIGatewayProxyHandler } from "aws-lambda";
import Database from "better-sqlite3";
import * as fs from "fs";
// import * as aws from "aws-sdk";
import {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";

type User = {
    id: number;
    name: string;
    age: number;
};

const s3Client = new S3Client({});

async function downloadFileFromS3(
    bucketName: string,
    key: string,
    file: string
) {
    try {
        const response = await s3Client.send(
            new GetObjectCommand({ Bucket: bucketName, Key: key })
        );

        const fileStream = fs.createWriteStream(file);
        (response.Body as Readable).pipe(fileStream);

        return new Promise<void>((resolve, reject) => {
            fileStream.on("finish", () => {
                resolve();
            });
            fileStream.on("error", (error) => {
                reject(error);
            });
        });
    } catch (error) {
        throw error;
    }
}

async function uploadFileToS3(bucketName: string, key: string, file: string) {
    const fileStream = fs.createReadStream(file);

    await s3Client.send(
        new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: fileStream,
        })
    );
}

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    const dbPath = "/tmp/test.db";

    const bucketName: string = process.env.BUCKET_NAME as string;

    try {
        await downloadFileFromS3(bucketName, "test.db", dbPath);
    } catch (e) {
        console.log(e);
    }

    const exists = fs.existsSync(dbPath);
    const db = new Database(dbPath);

    if (!exists) {
        db.exec(
            "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)"
        );
    }

    let select = db.prepare<User[]>(
        "SELECT * FROM users ORDER BY id DESC LIMIT 1"
    );

    let users = select.all() as User[];

    const lastId = users[0]?.id ?? 0;

    const insert = db.prepare("INSERT INTO users VALUES(?, ?, ?)");

    for (let i = 0; i < 10; i++) {
        const id = lastId + i + 1;
        insert.run(id, `User ${id}`, id + 20);
    }

    select = db.prepare<User[]>("SELECT * FROM users ORDER BY id DESC LIMIT 1");

    users = select.all() as User[];

    db.close();

    await uploadFileToS3(bucketName, "test.db", dbPath);

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Hello from Lambda!",
            users: users,
            bucketName: bucketName,
        }),
    };
};
