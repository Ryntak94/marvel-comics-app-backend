import { gql, ApolloServer } from 'apollo-server-micro'
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'
import neo4j from "neo4j-driver"
import { Neo4jGraphQL } from '@neo4j/graphql'

const user = process.env.NEO4J_USER
const password = process.env.NEO4J_PASSWORD
const uri = process.env.NEO4J_URI



const typeDefs = gql`
    type Comic {
        id: String
        isbn: String
        issueNumber: String
        marvelId: String
        title: String
        url: String
        next_issue: Comic @relationship(type: "Next_Issue", direction: OUT)
        series: Series @relationship(type: "Part_Of_Series", direction: OUT)
        variants: [Variant] @relationship(type: "Variant_Of", direction: IN)
        characters: [Character] @relationship(type: "Character_In", direction: IN)
        stories: [Story] @relationship(type: "Part_Of_Story", direction: OUT)
        creators: [Creator] @relationship(type: "Created_By", direction: OUT)
        events: [Event] @relationship(type: "Part_Of_Event", direction: OUT) 
    }

    type Variant {
        id: String
        isbn: String
        marvelId: String
        title: String
        url: String
        variant_of: Comic @relationship(type: "Variant_Of", direction: OUT)
    }

    type Collection {
        id: String
        marvelId: String
        title: String
        Comics: [Comic] @relationship(type: "Collected_By", direction: IN)
    }

    type Series {
        id: String
        marvelId: String
        title: String
        comics: [Comic] @relationship(type: "Part_Of_Series", direction: IN)
    }

    type Story {
        id: String
        marvelId: String
        title: String
        type: String
        comics: [Comic] @relationship(type: "Part_Of_Story", direction: IN)
    }

    type Event {
        id: String
        marvelId: String
        title: String
        comics: [Comic] @relationship(type: "Part_Of_Event", direction: IN)
    }

    type Creator {
        id: String
        marvelId: String
        title: String
        name: String
        role: String
        comics: [Comic] @relationship(type: "Created_By", direction: IN)
    }

    type Character {
        id: String
        marvelId: String
        title: String
        comics: [Comic] @relationship(type: "Character_In" direction: OUT)
    }
`

const driver = neo4j.driver(
    uri, neo4j.auth.basic(user, password)
)

const neoSchema = new Neo4jGraphQL({typeDefs, driver})

const apolloServer = new ApolloServer({
    schema: neoSchema.schema,
    playground: true,
    introspection: true,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground]
})

const startServer = apolloServer.start()

export default async function handler(req, res) {
    await startServer

    await apolloServer.createHandler({
        path: "/api/graphql"
    })(req, res)
}

export const config = {
    api: {
        bodyParser: false,
    },  
}