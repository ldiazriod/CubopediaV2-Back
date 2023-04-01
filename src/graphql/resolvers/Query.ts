import {ApolloError} from "apollo-server-express";
import {Db, Collection, WithId, ObjectId} from "mongodb"; 
import {Cube, ProfileInfo, Review, User} from "../../mongodb/mongoTypes"
import {app} from "../../server"

const Query = {
    getCubesByUser: async(parents: any, args: {authToken: string}): Promise<Cube[]> => {
        try{
            const db: Db = app.get("db");
            const user: WithId<User> | null = await db.collection<User>("Users").findOne({authToken: args.authToken});
            if(user){
                return await db.collection<Cube>("Cubes").find({_id: {$in: user.cubes}}).toArray()
            }
            return []
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    getPublicCubes: async( 
        parents: any, 
        args: {
            page: number, 
            search: { cardMainTitle?: string,  cubeDimensions?: string, cubeName?: string, cardReviewPoints?: number, cubeType?: boolean} | undefined} 
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
                    return await cubeCollection.find({
                        ...toFilter, 
                        cubeModName: {$exists: true, $ne: ""}, 
                        publicCube: true,
                        "cardReviewPoints.reviewMean": args.search.cardReviewPoints ? args.search.cardReviewPoints : 0
                    }).skip((args.page-1)*20).limit(20).toArray();
                }
                return await cubeCollection.find({
                    ...toFilter, 
                    "cardReviewPoints.reviewMean": args.search.cardReviewPoints ? args.search.cardReviewPoints : {$exists: true}, 
                    publicCube: true
                }).skip((args.page-1)*20).limit(20).toArray(); 
            }
            return await cubeCollection.find({publicCube: true}).skip((args.page-1)*20).limit(20).toArray(); 
        }catch(e){
            throw new ApolloError(`${e}`);
        }
    },
    getProfileInfo: async(parents: any, args: {input: {authToken?: string, id?: string}}): Promise<ProfileInfo | undefined> => {
        try{
            const db: Db = app.get("db")
            const userCollection = db.collection<{profileImg: string, cubes: ObjectId[], username: string}>("Users")
            const user: WithId<{profileImg: string, cubes: ObjectId[], username: string}> | null = args.input.authToken ? await userCollection.findOne({authToken: args.input.authToken}) 
                : await userCollection.findOne({_id: new ObjectId(args.input.id)})
            if(user){
                const cubes = await db.collection<Cube>("Cubes").find({"creator.creatorId": user._id.toString(), publicCube: true}).toArray()
                const numReviews = (await db.collection<Review>("Reviews").find({userId: user._id}).toArray()).length;
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
                    username: user.username, 
                    profileImg: user.profileImg,
                    numReviews: numReviews,
                    cardReviews: {
                        cardsTotalMean: mean ? Math.round(mean) : 0,
                        cardsTotalReviews: reviewsNum
                    },
                    cubes: cubes.map((elem) => {
                        const {creator, publicCube , ...rest} = elem
                        return rest
                    })
                }
            }
            return undefined
        }catch(e){
            throw new ApolloError(`${e}`)
        }
    },
    isUser: async(parents: any, args: {input: {authToken: string, id: string}}): Promise<boolean> => {
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
    getReview: async(parents: any, args: {input: {authToken: string, cubeId: string}}): Promise<{reviewed: boolean, reviewValue: number}> => {
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