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
        cardReviewPoints: Int!
        cardImg: String!
        public: Boolean!
    }

    type LogInReturn {
        creator: ID
        authToken: String
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
    type Query{
        getAllCubeCards: [Cube!]!
        getCubesByUser(authToken: String!): [Cube!]!
        getCubeById(cubeId: ID!): Cube!
        getUser(authToken: String!): User
        getPublicCubes(page: Int!, search: PublicSearch): [Cube!]!
        getCreator(id: ID!): String
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
    }
`
export default Schema;