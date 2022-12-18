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

    type Cube{
        _id: ID
        creator: String!
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
    }
`
export default Schema;