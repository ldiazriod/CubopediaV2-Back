import {MongoClient} from "mongodb";

const mongoConnect = async(url: string): Promise<MongoClient> => {
    const client = new MongoClient(url);
    return await client.connect();
}

export default mongoConnect;