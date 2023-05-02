import { APIGatewayProxyHandler } from "aws-lambda";
import Database from "better-sqlite3";

type User = {
    id: number;
    name: string;
    age: number;
};

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    const db = new Database(":memory:");
    db.exec(
        "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)"
    );

    const insert = db.prepare("INSERT INTO users VALUES(?, ?, ?)");

    for (let i = 0; i < 10; i++) {
        insert.run(i, `User ${i}`, i + 20);
    }

    const select = db.prepare<User[]>("SELECT * FROM users");

    const iter = select.iterate() as IterableIterator<User>;

    const users: User[] = [];
    for (const user of iter) {
        console.log(user.id, user.name, user.age);
        users.push(user);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Hello from Lambda!",
            users: users,
        }),
    };
};
