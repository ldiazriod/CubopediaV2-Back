import { ApolloServer, ExpressContext } from "apollo-server-express";
import {ApolloServerPluginLandingPageGraphQLPlayground} from "apollo-server-core"
import { MongoClient } from "mongodb";
import express from "express"
import cors from "cors"

import mongoConnect from "./mongodb/mongoconnect";
import Schema from "./graphql/schema/schema";
import Mutation  from "./graphql/resolvers/Mutations";
import Query from "./graphql/resolvers/Query";

const resolvers = {
    Query,
    Mutation
}

export const app = express();

const run = async() => {
    try{
        const client: MongoClient = await mongoConnect("mongodb+srv://luis:nebrija@backend.amsuu.mongodb.net/?retryWrites=true&w=majority")
        app.set("db", client.db("Cubopedia"))
    }catch(e){
        console.log(e);
    }
}

const server: ApolloServer<ExpressContext> = new ApolloServer({
    typeDefs: Schema,
    resolvers: resolvers,
    plugins: [
        ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
    context: (ctx) => {
        return {
            ctx,
        }
    },
    introspection: true,
    cache: "bounded",
    persistedQueries: false,
});

const serverStart = async() => {
    try{
        run()
        await server.start();
        server.applyMiddleware({
            app: app,
            path: "/",
            cors: true
        })
    }catch(e){
        console.log(e);
    }
}
serverStart();
app.use(express.json())
app.use(cors())

const port = process.env.PORT!==undefined ? Number.parseInt(process.env.PORT) : 4000
app.listen({port: port}, () => {
    console.log("Application runing on http://localhost:4000")
})

