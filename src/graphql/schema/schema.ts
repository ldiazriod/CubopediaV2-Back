import {gql} from "apollo-server-express";

const Schema = gql`
    type User{
        _id: ID
        name: String
        lastname: String
        profileImg: String
        authToken: String
        username: String!
        email: String!
        password: String!
        cubes: [Cube]!
    }

    type Creator{
        creatorId: String!
        username: String
    }
    type Reviews {
        reviewMean: Int!
        reviews: [ID!]!
    }
    type Cube{
        _id: ID
        creator: Creator!
        cubeName: String!
        cubeDimensions: String!
        cubeModName: String
        cubeModel: String
        cubeBrand: String
        cubeDesigner: String
        cardMainTitle: String!
        cardText: String!
        cardReviewPoints: Reviews!
        cardImg: String!
        public: Boolean!
    }

    type ProfileCube {
        _id: ID!
        cubeName: String!
        cubeDimensions: String!
        cubeModName: String
        cubeModel: String
        cubeBrand: String
        cubeDesigner: String
        cardMainTitle: String!
        cardText: String!
        cardReviewPoints: Reviews!
        cardImg: String!
    }
    type UserReviewsInfo {
        cardsTotalMean: Int!
        cardsTotalReviews: Int!
    }
    type ProfileInfo {
        username: String
        profileImg: String!
        numReviews: Int!
        cardReviews: UserReviewsInfo!
        cubes: [ProfileCube!]!
    }
    type LogInReturn {
        creator: ID
        authToken: String
    }
    type ReturnReview {
        reviewed: Boolean!
        reviewValue: Int
    }
    input CubeInput{
        _id: ID
        creator: ID!
        cubeName: String!
        cubeDimensions: String!
        cubeModName: String
        cubeModel: String
        cubeBrand: String
        cubeDesigner: String
        cardMainTitle: String!
        cardText: String!
        cardReviewPoints: Int!
        cardImg: String!
        public: Boolean!
    }

    input PublicSearch {
        cardMainTitle: String
        cubeDimensions: String
        cubeName: String
        cardReviewPoints: Int
        cubeType: Boolean
    }
    input CloneInfo {
        id: ID!
        authToken: String!
    }
    input CreatorInput {
        creatorId: String!
        username: String!
    }
    input UpdateCubeInput {
        _id: ID
        creator: CreatorInput!
        cubeName: String!
        cubeDimensions: String!
        cubeModName: String
        cubeModel: String
        cubeBrand: String
        cubeDesigner: String
        cardMainTitle: String!
        cardText: String!
        cardReviewPoints: Int!
        cardImg: String!
        public: Boolean!
    }
    input ProfileInput {
        authToken: String
        id: String
    }
    input ChangeImage {
        imgName: String!
        authToken: String!
    }
    input DeleteUserInput {
        authToken: String!
        password: String!
    }
    input ReviewInput {
        userId: ID!
        cubeId: ID!
        points: Int!
    }
    input GetReviewInput {
        cubeId: ID!
        authToken: String!
    }
    type Query{
        getAllCubeCards: [Cube!]!
        getCubesByUser(authToken: String!): [Cube!]!
        getCubeById(cubeId: ID!): Cube!
        getUser(authToken: String!): User
        getPublicCubes(page: Int!, search: PublicSearch): [Cube!]!
        getCreator(id: ID!): String
        getProfileInfo(input: ProfileInput!): ProfileInfo
        isUser(input: ProfileInput!): Boolean!
        getReview(input: GetReviewInput!): ReturnReview!
    }
    type Mutation{
        logIn(username: String, email: String, password: String!): LogInReturn
        signUp(username: String!, email: String!, password: String!): String
        addCubeCard(info: CubeInput!): Boolean!
        logOut(authToken: String!): Boolean!
        makePublic(id: ID!): Boolean!
        deleteCube(id: ID!): Boolean!
        changeCube(input: UpdateCubeInput!): Boolean!
        cloneCube(input: CloneInfo!): Boolean!
        changeProfileImg(input: ChangeImage!): Boolean!
        deleteUser(input: DeleteUserInput!): Boolean!
        addReview(input: ReviewInput!): Boolean!
    }
`
export default Schema;