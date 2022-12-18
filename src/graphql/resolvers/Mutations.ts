import {ApolloError} from "apollo-server-express";
import { Request, Response } from "express";
import {Db, Collection, WithId, ObjectId} from "mongodb";
import {User, Cube} from "../../mongodb/mongoTypes"
import {app} from "../../server"
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
 
const Mutation = {
    logIn: async(parents: any, args: {username: string, email: string | undefined, password: string}, ctx: {req: Request, res: Response}): Promise<{creator: string, authToken: string} | undefined> => {
        try{
            const db: Db = app.get("db");
            const userCollection: Collection<User> = db.collection<User>("Users")
            const user: WithId<User> | null = await userCollection.findOne({$or: [{"username": args.username, "password": args.password}, {"email": args.email, "password": args.password}]})
            if(user){
                if(!user.authToken || user.authToken.length === 0){
                    const token = uuidv4();
                    await db.collection<User>("Users").findOneAndUpdate(user, {$set: {authToken: token}});
                    return {
                        creator: String(user._id),
                        authToken: token
                    };
                }
                return {
                    creator: String(user._id),
                    authToken: user.authToken
                }
            }
            return undefined;
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    signUp: async(parents: any, args: {username: string, email: string, password: string}, ctx: {req: Request, res: Response}): Promise<string | undefined> => {
        try{
            const db: Db = app.get("db");
            const userCollection: Collection<User> = db.collection<User>("Users")
            const user: WithId<User> | null = await userCollection.findOne({$or: [{"username": args.username, "password": args.password}, {"email": args.email, "password": args.password}]})
            if(!user){
                const token = uuidv4()
                await userCollection.insertOne({
                    username: args.username, 
                    email: args.email, 
                    password: args.password,
                    cubes: [], 
                    authToken: token
                })
                return token
            }
            return undefined;
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    addCubeCard: async(parent: any, args: {info: Cube}, ctx:{req: Request, res: Response}): Promise<boolean> => {
        try{
            const db: Db = app.get("db")
            const cubeCollection: Collection<Cube> = db.collection<Cube>("Cubes")
            const userCollection: Collection<User> = db.collection<User>("Users")
            const findCard: WithId<Cube> | null = await cubeCollection.findOne({creator: args.info.creator, cardMainTitle: args.info.cardMainTitle, cubeName: args.info.cubeName})
            if(!findCard){
                await cubeCollection.insertOne(args.info);
                const user = await userCollection.findOne({_id: new ObjectId(args.info.creator)})
                if(user){
                    await userCollection.updateOne(user, {$set: {cubes: [...user?.cubes, args.info]}})
                }
                return true;
            }
            return false;
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    logOut: async(parent: any, args: {authToken: string}, ctx:{req: Request, res: Response}): Promise<boolean> => {
        try{
            const db: Db = app.get("db")
            const userCollection: Collection<User> = db.collection<User>("Users")
            await userCollection.findOneAndUpdate({authToken: args.authToken}, {$set: {authToken: ""}})
            return true
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    makePublic: async(parent: any, args: {id: ObjectId}, ctx:{req: Request, res: Response}): Promise<boolean> => {
        try{
            const db: Db = app.get("db")
            const cubeCollection: Collection<Cube> = db.collection<Cube>("Cubes")
            await cubeCollection.findOneAndUpdate({_id: new ObjectId(args.id)}, {$set:{public: true}})
            return true
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    }
}

export default Mutation;

