import {ApolloError} from "apollo-server-express";
import { Request, Response } from "express";
import {Db, Collection, WithId, ObjectId} from "mongodb"; 
import {Cube, PublicCube, User} from "../../mongodb/mongoTypes"
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
                return await cubeCollection.find({_id: {$in: user.cubes}}).toArray()
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
    getUser: async(parents: any, args: {authToken: string}, ctx: {req: Request, res: Response}): Promise<WithId<User> | null> => {
        try{
            const db: Db = app.get("db")
            const user: WithId<User> | null = await db.collection<User>("Users").findOne({authToken: args.authToken})
            return user;
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    getPublicCubes: async(
        parents: any, 
        args: {
            page: number, 
            search: {
                cardMainTitle: string | undefined, 
                cubeDimensions: string | undefined, 
                cubeName: string | undefined, 
                cardReviewPoints: number | undefined, 
                cubeType: boolean | undefined
            } | undefined}, 
            ctx: {
                req: Request, 
                res: Response
            }): Promise<WithId<Cube>[] | null> => {
        try{
            const db: Db = app.get("db")
            const cubeCollection: Collection<Cube> = db.collection<Cube>("Cubes");
            if(args.search){
                const toFilter = Object.create(args.search)
                if(args.search.cardMainTitle){
                    toFilter.cardMainTitle = {$regex: args.search.cardMainTitle}
                }
                if(args.search.cubeDimensions){
                    toFilter.cubeDimensions = {$regex: args.search.cubeDimensions}
                }
                if(args.search. cubeName){
                    toFilter.cubeName = {$regex: args.search.cubeName}
                }
                if(args.search.cardReviewPoints){
                    toFilter.cardReviewPoints = args.search.cardReviewPoints
                }
                if(args.search.cubeType !== undefined && args.search.cubeType){
                    return await cubeCollection.find({...toFilter, cubeModName: {$exists: args.search.cubeType, $ne: ""} , public: true}).skip((args.page-1)*20).limit(20).toArray();
                }
                return await cubeCollection.find({...toFilter, public: true}).skip((args.page-1)*20).limit(20).toArray(); 
            }
            return await cubeCollection.find({public: true}).skip((args.page-1)*20).limit(20).toArray(); 
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    getCreator: async(parents: any, args: {id: ObjectId}, ctx: {req: Request, res: Response}): Promise<string> => {
        try{
            const db: Db = app.get("db")
            const user: WithId<User> | null = await db.collection<User>("Users").findOne({_id: new ObjectId(args.id)})
            return user ? user.username : "";
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
}

export default Query;