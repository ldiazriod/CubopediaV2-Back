import {ApolloError} from "apollo-server-express";
import {Db, Collection, WithId, ObjectId} from "mongodb";
import {User, Cube, InputCube, PublicCube, Context, Review} from "../../mongodb/mongoTypes"
import {app} from "../../server"
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";

const Mutation = {
    logIn: async(
            parents: any, 
            args: {username: string | undefined, email: string | undefined, password: string}
        ): Promise<{creator: string, authToken: string} | undefined> => {
        try{
            const db: Db = app.get("db");
            const userCollection: Collection<User> = db.collection<User>("Users")
            const user: WithId<User> | null = await userCollection.findOne({
                $or: [
                    {"username": args.username, "password": args.password}, 
                    {"email": args.email, "password": args.password}
                ]
            })
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
    signUp: async(
            parents: any, 
            args: {username: string, email: string, password: string, name?: string, lastName?: string}
        ): Promise<{authToken: string, creator: string} | undefined> => {
        try{
            const db: Db = app.get("db");
            const userCollection: Collection<User> = db.collection<User>("Users")
            const user: WithId<User> | null = await userCollection.findOne({
                $or: [
                    {"username": args.username}, 
                    {"email": args.email}
                ]
            })
            if(!user){
                const token = uuidv4()
                const {insertedId} = await userCollection.insertOne({
                    ...args,
                    cubes: [], 
                    authToken: token,
                    profileImg: ""
                })
                return {authToken: token, creator: insertedId.toString()}
            }
            return undefined;
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    addCubeCard: async(parent: any, args: {info: InputCube}): Promise<boolean> => {
        try{
            const db: Db = app.get("db")
            const cubeCollection: Collection<Cube> = db.collection<Cube>("Cubes")
            const userCollection: Collection<User> = db.collection<User>("Users")
            const user = await userCollection.findOne({_id: new ObjectId(args.info.creator)})
            if(user){
                const findCard: WithId<Cube> | null = await cubeCollection.findOne({
                    creator: {creatorId: args.info.creator},
                    cardMainTitle: args.info.cardMainTitle, 
                    cardText: args.info.cardText,
                })
                if(!findCard){
                    const {insertedId} = await cubeCollection.insertOne({
                        ...args.info,
                        creator: {
                            creatorId: args.info.creator,
                            username: user.username
                        },
                        cardReviewPoints: {
                            reviewMean: 0,
                            reviews: []
                        }
                    });
                    await userCollection.updateOne(user, {$set: {cubes: [...user.cubes, insertedId]}})
                }
                return true;
            }
            return false;
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    logOut: async(parent: any, args: {authToken: string}): Promise<boolean> => {
        try{
            const db: Db = app.get("db")
            const userCollection: Collection<User> = db.collection<User>("Users")
            await userCollection.findOneAndUpdate({authToken: args.authToken}, {$set: {authToken: ""}})
            return true
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    makePublic: async(parent: any, args: {id: ObjectId}): Promise<boolean> => {
        try{
            const db: Db = app.get("db")
            const cubeCollection: Collection<Cube> = db.collection<Cube>("Cubes")
            await cubeCollection.findOneAndUpdate({_id: new ObjectId(args.id)}, {$set:{publicCube: true}})
            return true
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    deleteCube: async(parent: any, args: {id: ObjectId}): Promise<boolean> => {
        try{
            const db: Db = app.get("db");
            const cubeCollection: Collection<Cube> = db.collection<Cube>("Cubes")
            const userCollection: Collection<User> = db.collection<User>("Users")
            const reviewCollection: Collection<Review> = db.collection<Review>("Reviews")
            const cube = await cubeCollection.findOne({_id: new ObjectId(args.id)})
            if(cube){
                await reviewCollection.deleteMany({cubeId: cube._id})
                await userCollection.updateMany({cubes: new ObjectId(args.id)}, {$pull: {cubes: new ObjectId(args.id)}})
                await cubeCollection.deleteOne(cube)
                await axios.post(`${process.env.IMG_API_URL}/delete/${cube.cardImg}`)
                return true
            }
            return false
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    changeCube: async(parent: any, args: {input: Cube}): Promise<boolean> => {
        try{
            const db: Db = app.get("db");
            const cubeCollection: Collection<Cube> = db.collection<Cube>("Cubes")
            await cubeCollection.findOneAndUpdate({_id: new ObjectId(args.input._id)}, {$set: {
                cubeName: args.input.cubeName,
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
    cloneCube: async(parent: any, args: {input: {id: ObjectId, authToken: string}}): Promise<boolean> => {
        try{
            const db: Db = app.get("db");
            const userCollection: Collection<User> = db.collection<User>("Users")
            const user = await userCollection.findOne({authToken: args.input.authToken})
            if(user){
                if(!user.cubes.find((elem) => elem === new ObjectId(args.input.id))){
                    await userCollection.updateOne(user, {$push: {cubes: new ObjectId(args.input.id)}})
                    return true
                }
                return false
            }
            return false
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    changeProfileImg: async(parent: any, args: {input: {imgName: string, authToken: string}}): Promise<boolean> => {
        try{
            const db: Db = app.get("db");
            const userCollection: Collection<User> = db.collection<User>("Users")
            await userCollection.findOneAndUpdate({authToken: args.input.authToken}, {$set: {profileImg: args.input.imgName}})
            return true
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    deleteUser: async(parent: any, args: {input: {authToken: string, password: string}}): Promise<boolean> => {
        try{
            const db: Db = app.get("db");
            const userCollection: Collection<User> = db.collection<User>("Users")
            const user = await userCollection.findOne({authToken: args.input.authToken, password: args.input.password})
            if(user){
                const cubeCollection: Collection<Cube> = db.collection<Cube>("Cubes")
                const reviewCollection: Collection<Review> = db.collection<Review>("Reviews")
                const userReviews = await reviewCollection.find({userId: user._id}).toArray();
                await cubeCollection.updateMany(
                    {"cardReviewPoints.reviews": {$in: userReviews.map((elem) => elem._id)}}, 
                    {$pull: {"cardReviewPoints.reviews": userReviews.map((elem) => elem._id)}})
                await reviewCollection.deleteMany({userId: user._id})
                if(user.profileImg?.length !== 0){
                    await axios.post(`${process.env.IMG_API_URL}/delete/${user.profileImg}`)
                }
                const userCubes = (await cubeCollection.find(
                    {"creator.creatorId": user._id.toString()}
                ).toArray()).filter((elem) => elem.creator.creatorId === user._id.toString()).map((elem2) => elem2._id);
                await cubeCollection.deleteMany({_id: {$in: userCubes}})
                await userCollection.updateMany(
                    {cubes: userCubes}, 
                    {$pull: {cubes: userCubes}}
                )
                await userCollection.deleteOne(user)
                return true
            }            
            return false
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    addReview: async(parent: any, args: {input: {userId: string, cubeId: string, points: number}}): Promise<boolean> => {
        try{
            const db: Db = app.get("db");
            const userCollection: Collection<User> = db.collection<User>("Users")
            const user = await userCollection.findOne({_id: new ObjectId(args.input.userId)})
            if(user){
                const reviewCollection: Collection<Review> = db.collection<Review>("Reviews")
                const reviewed = await reviewCollection.findOne({
                    userId: new ObjectId(args.input.userId), 
                    cubeId:new ObjectId(args.input.cubeId)
                })
                if(!reviewed){
                    const cubeCollection: Collection<Cube> = db.collection<Cube>("Cubes")
                    const {insertedId} = await reviewCollection.insertOne({
                        userId: new ObjectId(args.input.userId),
                        cubeId: new ObjectId(args.input.cubeId),
                        points: args.input.points
                    })
                    const cubeReviews = await reviewCollection.find({cubeId: new ObjectId(args.input.cubeId)}).toArray()
                    const mean = Math.round((cubeReviews.reduce((sum, elem) => sum + elem.points, 0)+args.input.points) / (cubeReviews.length+1));
                    await cubeCollection.findOneAndUpdate(
                        {_id: new ObjectId(args.input.cubeId)}, 
                        {$push: {"cardReviewPoints.reviews": insertedId}, $set: {"cardReviewPoints.reviewMean": mean}}
                    )
                    return true
                }
                return false;
            }
            return false;
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    }
}

export default Mutation;

