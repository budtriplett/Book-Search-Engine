import { AuthenticationError } from "apollo-server-express";
import User from "../models/User.js";
import { signToken } from "../services/auth.js";

const resolvers = {
    Query: {
        getSingleUser: async (_parent: any, { id, username }: { id?: string; username?: string }, context: any) => {
            if (!context.user) {
                throw new AuthenticationError('Not logged in');
            }
            const foundUser = await User.findOne({
                $or: [{ _id: id }, { username }],
            });
            if (!foundUser) {
                throw new Error('Cannot find a user with this id or username!');
            }

            return foundUser;
        },
        me: async (_parent: any, _args: any, context: any) => {
            if (!context.user) {
                throw new AuthenticationError('Not logged in');
            }
            return await User.findById(context.user._id);
        }
    },

    Mutation: {
        addUser: async (_parent: any, { username, email, password }: { username: string; email: string; password: string }) => {
            const user = await User.create({ username, email, password });
            if (!user) {
                throw new Error('Something went wrong while creating the user');
            }
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },

        login: async (_parent: any, { email, password }: { email: string; password: string }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Cannot find this user');
            }

            const isPasswordValid = await user.isCorrectPassword(password);
            if (!isPasswordValid) {
                throw new AuthenticationError('Invalid password');
            }

            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },

        saveBook: async (_parent: any, { authors, description, title, bookId, image, link }: 
            { authors: string[], description?: string, title: string, bookId: string, image?: string, link?: string }, 
            context: any) => {

            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }

            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { 
                    $addToSet: { 
                        savedBooks: { authors, description, title, bookId, image, link } 
                    } 
                },
                { new: true, runValidators: true }
            );

            if (!updatedUser) {
                throw new Error('Could not save book');
            }

            return updatedUser;
        },

        removeBook: async (_parent: any, { bookId }: { bookId: string }, context: any) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }

            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId } } },
                { new: true }
            );

            if (!updatedUser) {
                throw new Error('No user with this id found.');
            }

            return updatedUser;
        },
    },
};

export default resolvers;