import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    type Query {
        me: User
        getSingleUser(id: ID, username: String): User
    } 
    
     type Mutation {
        login(email: String!, password: String!): Auth
        addUser(username: String!, email: String!, password: String!): Auth
        saveBook(
            authors: [String!],
            description: String,
            title: String,
            bookId: String!,
            image: String,
            link: String
            ): User
        removeBook(bookId: String!): User
    }    
    
    type User {
        _id: ID!
        username: String!
        email: String!
        bookCount: Int!
        savedBooks: [Book]!
    }


    type Book {
        bookId: ID!
        authors: [String!]!
        description: String
        title: String!
        image: String
        link: String
    }

    type Auth {
        token: String!
        user: User!
    }
`;

export default typeDefs;