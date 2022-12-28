import {ApolloError} from "apollo-server-express";
import { Request, Response } from "express";
import {Db, Collection, WithId, ObjectId} from "mongodb";
import {User, Cube, InputCube, PublicCube} from "../../mongodb/mongoTypes"
import {app} from "../../server"
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";

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
    addCubeCard: async(parent: any, args: {info: InputCube}, ctx:{req: Request, res: Response}): Promise<boolean> => {
        try{
            const db: Db = app.get("db")
            const cubeCollection: Collection<Cube> = db.collection<Cube>("Cubes")
            const userCollection: Collection<User> = db.collection<User>("Users")
            const findCard: WithId<Cube> | null = await cubeCollection.findOne({creator: {creatorId: args.info.creator}, cardMainTitle: args.info.cardMainTitle, cubeName: args.info.cubeName})
            if(!findCard){
                const user = await userCollection.findOne({_id: new ObjectId(args.info.creator)})
                if(user){
                    const newCubeInfo = {
                        ...args.info,
                        creator: {
                            creatorId: args.info.creator,
                            username: user.username
                        }
                    }
                    const {insertedId} = await cubeCollection.insertOne(newCubeInfo);
                    await userCollection.updateOne(user, {$set: {cubes: [...user.cubes, insertedId]}})
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
    },
    deleteCube: async(parent: any, args: {id: ObjectId}, ctx: {req: Request, res: Response}): Promise<boolean> => {
        try{
            const db: Db = app.get("db");
            const cubeCollection: Collection<Cube> = db.collection<Cube>("Cubes")
            const userCollection: Collection<User> = db.collection<User>("Users")
            const cube = await cubeCollection.findOne({_id: new ObjectId(args.id)})
            if(cube){
                await userCollection.updateMany({cubes: new ObjectId(args.id)}, {$pull: {cubes: new ObjectId(args.id)}})
                await axios.post(`${process.env.IMG_API_URL}/delete/${cube.cardImg}`)
                await cubeCollection.deleteOne(cube)
                return true
            }
            return false
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    changeCube: async(parent: any, args: {input: Cube}, ctx: {req: Request, res: Response}): Promise<boolean> => {
        try{
            const db: Db = app.get("db");
            const cubeCollection: Collection<Cube> = db.collection<Cube>("Cubes")
            await cubeCollection.findOneAndUpdate({_id: new ObjectId(args.input._id)}, {$set: {
                creator: args.input.creator,
                cubeName: args.input.cubeName,
                cubeDimensions: args.input.cubeDimensions,
                cubeModName: args.input.cubeModName,
                cubeModel: args.input.cubeModel,
                cubeBrand: args.input.cubeBrand,
                cubeDesigner: args.input.cubeDesigner,
                cardMainTitle: args.input.cardMainTitle,
                cardText: args.input.cardText,
            }})
            return true
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    cloneCube: async(parent: any, args: {input: {id: ObjectId, authToken: string}}, ctx: {req: Request, res: Response}): Promise<boolean> => {
        try{
            const db: Db = app.get("db");
            const userCollection: Collection<User> = db.collection<User>("Users")
            const user = await userCollection.findOne({authToken: args.input.authToken})
            if(user){
                if(!user.cubes.find((elem) => elem === new ObjectId(args.input.id))){
                    await userCollection.updateOne(user, {$set: {cubes: [...user.cubes, new ObjectId(args.input.id)]}})
                    return true
                }
                return false
            }
            return false
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    }
}

export default Mutation;

