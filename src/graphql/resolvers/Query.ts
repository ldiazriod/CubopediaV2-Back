import {ApolloError} from "apollo-server-express";
import { Request, Response } from "express";
import {Db, Collection, WithId, ObjectId} from "mongodb";
import * as uuid from "uuid";
 
import {Cube, User} from "../../mongodb/mongoTypes"
import {app} from "../../server"
const Query = {
    getAllCubeCards: async(parents: any, args: {}, ctx: {req: Request, res: Response}): Promise<Cube[]> => {
        try{
            const db: Db = app.get("db");
            const cubeCollection: Collection<Cube> = db.collection<Cube>("Cubes");
            return await cubeCollection.find({}).toArray();
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    getCubesByUser: async(parents: any, args: {authToken: string}, ctx: {req: Request, res: Response}): Promise<Cube[]> => {
        try{
            const db: Db = app.get("db");
            const cubeCollection: Collection<Cube> = db.collection<Cube>("Cubes");
            const userCollection: Collection<User> = db.collection<User>("Users")
            const user: WithId<User> | null = await userCollection.findOne({authToken: args.authToken});
            if(user){
                return await cubeCollection.find({creator: (user._id).toString()}).toArray();
            }
            return []
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    getCubeById: async(parents: any, args: {cubeId: string}, ctx: {req: Request, res: Response}): Promise<WithId<Cube> | null> => {
        try{
            const db: Db = app.get("db");
            const cubeCollection: Collection<Cube> = db.collection<Cube>("Cubes");
            return await cubeCollection.findOne({_id: new ObjectId(args.cubeId)});
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    getUser: async(parents: any, args: {authToken: string}, ctx: {req: Request, res: Response}): Promise<WithId<User> | null>=> {
        try{
            const db: Db = app.get("db")
            const user: WithId<User> | null = await db.collection<User>("Users").findOne({authToken: args.authToken})
            return user;
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    }
}

export default Query;