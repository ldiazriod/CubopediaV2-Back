import {ApolloError} from "apollo-server-express";
import {Db, Collection, WithId, ObjectId} from "mongodb"; 
import {Context, Cube, ProfileCube, ProfileInfo, PublicCube, Review, User} from "../../mongodb/mongoTypes"
import {app} from "../../server"

const Query = {
    getAllCubeCards: async(parents: any, args: {}, ctx: Context): Promise<Cube[]> => {
        try{
            const db: Db = app.get("db");
            const cubeCollection: Collection<Cube> = db.collection<Cube>("Cubes");
            return await cubeCollection.find({}).toArray();
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    getCubesByUser: async(parents: any, args: {authToken: string}, ctx: Context): Promise<Cube[]> => {
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
    getCubeById: async(parents: any, args: {cubeId: string}, ctx: Context): Promise<WithId<Cube> | null> => {
        try{
            const db: Db = app.get("db");
            const cubeCollection: Collection<Cube> = db.collection<Cube>("Cubes");
            return await cubeCollection.findOne({_id: new ObjectId(args.cubeId)});
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    getUser: async(parents: any, args: {authToken: string}, ctx: Context): Promise<WithId<User> | null> => {
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
            ctx: Context
            ): Promise<WithId<Cube>[] | null> => {
        try{
            const db: Db = app.get("db")
            const cubeCollection: Collection<Cube> = db.collection<Cube>("Cubes");
            if(args.search){
                const toFilter = Object.create(args.search)
                if(args.search.cardMainTitle){
                    toFilter.cardMainTitle = {$regex: args.search.cardMainTitle, $options: 'i'}
                }
                if(args.search.cubeDimensions){
                    toFilter.cubeDimensions = {$regex: args.search.cubeDimensions}
                }
                if(args.search. cubeName){
                    toFilter.cubeName = {$regex: args.search.cubeName}
                }
                if(args.search.cubeType !== undefined && args.search.cubeType){
                    return await cubeCollection.find({...toFilter, cubeModName: {$exists: true, $ne: ""}, public: true, "cardReviewPoints.reviewMean": args.search.cardReviewPoints ? args.search.cardReviewPoints : 0}).skip((args.page-1)*20).limit(20).toArray();
                }
                return await cubeCollection.find({...toFilter, "cardReviewPoints.reviewMean": args.search.cardReviewPoints ? args.search.cardReviewPoints : {$exists: true}, public: true}).skip((args.page-1)*20).limit(20).toArray(); 
            }
            return await cubeCollection.find({public: true}).skip((args.page-1)*20).limit(20).toArray(); 
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    getCreator: async(parents: any, args: {id: ObjectId}, ctx: Context): Promise<string> => {
        try{
            const db: Db = app.get("db")
            const user: WithId<User> | null = await db.collection<User>("Users").findOne({_id: new ObjectId(args.id)})
            return user ? user.username : "";
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    getProfileInfo: async(parents: any, args: {input: {authToken?: string, id?: string}}, ctx: Context): Promise<ProfileInfo | undefined> => {
        try{
            const db: Db = app.get("db")
            const userCollection = db.collection<{profileImg: string, cubes: ObjectId[], username: string}>("Users")
            const user: WithId<{profileImg: string, cubes: ObjectId[], username: string}> | null = args.input.authToken ? await userCollection.findOne({authToken: args.input.authToken}) : await userCollection.findOne({_id: new ObjectId(args.input.id)})
            if(user){
                const profileUser = await userCollection.findOne({_id: new ObjectId(args.input.id)})
                const cubeCollection: Collection<Cube> = db.collection<Cube>("Cubes");
                const reviewCollection: Collection<Review> = db.collection<Review>("Reviews")
                const cubes = await cubeCollection.find({"creator.creatorId": args.input.id, public: true}).toArray()
                const numReviews = (await reviewCollection.find({userId: user._id}).toArray()).length;
                let mean = 0;
                let reviewsNum = 0;
                cubes.forEach((elem) => {
                    if(elem.cardReviewPoints.reviews.length > 0){
                        mean += elem.cardReviewPoints.reviewMean,
                        reviewsNum += elem.cardReviewPoints.reviews.length 
                    }
                })
                mean = mean / cubes.filter((elem) => elem.cardReviewPoints.reviews.length > 0).length;
                
                return {
                    username: profileUser ? profileUser.username : "", 
                    profileImg: user.profileImg,
                    numReviews: numReviews,
                    cardReviews: {
                        cardsTotalMean: mean ? Math.round(mean) : 0,
                        cardsTotalReviews: reviewsNum
                    },
                    cubes: cubes.map((elem) => {
                        return {
                            _id: elem._id,
                            cubeName: elem.cubeName,
                            cubeDimensions: elem.cubeDimensions,
                            cubeModName: elem.cubeModName ? elem.cubeModName : "",
                            cubeModel: elem.cubeModel ? elem.cubeModel : "",
                            cubeBrand: elem.cubeBrand ? elem.cubeBrand : "",
                            cubeDesigner: elem.cubeDesigner ? elem.cubeDesigner : "",
                            cardMainTitle: elem.cardMainTitle,
                            cardText: elem.cardText,
                            cardReviewPoints: elem.cardReviewPoints,
                            cardImg: elem.cardImg
                        }
                    })
                }
            }
            return undefined
        }catch(e){
            throw new ApolloError(`${e}`)
        }
    },
    isUser: async(parents: any, args: {input: {authToken: string, id: string}}, ctx: Context): Promise<boolean> => {
        try{
            const db: Db = app.get("db")
            const userCollection = db.collection<{profileImg: string, cubes: ObjectId[]}>("Users")
            const user = await userCollection.findOne({_id: new ObjectId(args.input.id),authToken: args.input.authToken})
            if(user){
                return true
            }
            return false
        }catch(e){
            throw new ApolloError(`${e}`)
        }
    },
    getReview: async(parents: any, args: {input: {authToken: string, cubeId: string}}, ctx: Context): Promise<{reviewed: boolean, reviewValue: number}> => {
        try{
            const db: Db = app.get("db")
            const userCollection = db.collection<{profileImg: string, cubes: ObjectId[]}>("Users")
            const user = await userCollection.findOne({authToken: args.input.authToken})
            if(user){
                const review = await db.collection<Review>("Reviews").findOne({userId: user._id, cubeId: new ObjectId(args.input.cubeId)})
                return review ? {
                    reviewed: true,
                    reviewValue: review.points
                } : {
                    reviewed: false,
                    reviewValue: 0
                }
            }
            return {
                reviewed: false,
                reviewValue: 0
            }
        }catch(e){
            throw new ApolloError(`${e}`)
        }
    }
}

export default Query;