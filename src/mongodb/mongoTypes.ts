import {ObjectId} from "mongodb"
import { Request, Response } from "express";

export type Context = {
    req: Request,
    res: Response
}

export type User = {
    _id?: ObjectId;
    name?: string | undefined;
    lastname?: string | undefined;
    profileImg?: string | undefined;
    authToken?: string | undefined;
    username: string;
    email: string;
    password: string;
    cubes: ObjectId[]
}
export type Cube = {
    _id?: ObjectId;
    creator: {
        creatorId: string,
        username: string
    };
    cubeName: string;
    cubeDimensions: string;
    cubeModName: string | undefined;
    cubeModel: string | undefined;
    cubeBrand: string | undefined;
    cubeDesigner: string | undefined;
    cardMainTitle: string;
    cardText: string;
    cardReviewPoints: {
        reviewMean: number,
        reviews: ObjectId[]
    };
    cardImg: string;
    publicCube: boolean;
}

export type Review = {
    _id?: ObjectId
    userId: ObjectId
    cubeId: ObjectId
    points: number
}

export type InputCube = {
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
    publicCube: boolean;
}

export type PublicCube = {
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
    cardReviewPoints: {
        reviewMean: number,
        reviews: ObjectId[]
    };
    cardImg: string;
    publicCube: boolean;
}

export type ProfileCube = {
    _id: ObjectId
    cubeName: string
    cubeDimensions: string
    cubeModName: string | undefined
    cubeModel: string | undefined
    cubeBrand: string | undefined
    cubeDesigner: string | undefined
    cardMainTitle: string
    cardText: string
    cardReviewPoints: {
        reviewMean: number,
        reviews: ObjectId[]
    };
    cardImg: string
}
export type ProfileInfo = {
    username: string
    profileImg: string
    numReviews: number
    cardReviews: {
        cardsTotalMean: number,
        cardsTotalReviews: number
    }
    cubes: ProfileCube[]
}

