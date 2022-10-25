import {ObjectId} from "mongodb"

export type User = {
    _id?: ObjectId;
    name?: string | undefined;
    lastname?: string | undefined;
    profileImg?: string | undefined;
    authToken?: string | undefined;
    username: string;
    email: string;
    password: string;
    cubes: Cube[]
}

export type Cube = {
    _id?: ObjectId;
    creator: string;
    cubeName: string;
    cubeDimensions: string;
    cubeModName: string | undefined;
    cubeModel: string | undefined;
    cubeBrand: string | undefined;
    cubeDesigner: string | undefined;
    cardMainTitle: string;
    cardText: string;
    cardReviewPoints: number;
    cardImg: string;
    public: boolean;
}