"use server"

import {connectToDB} from "@/lib/mongoose";
import User from "@/lib/models/user.model";
import {revalidatePath} from "next/cache";
import Post from "@/lib/models/post.model";

interface Params {
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    path: string;
}

export async function updateUser({
 userId,
 username,
 name,
 bio,
 image,
 path,
}: Params): Promise<void>{
    await connectToDB();

    try {
        await User.findOneAndUpdate(
            { id: userId },
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true,
            },
            { upsert: true }
        );

        if(path === 'profile/edit'){
            revalidatePath(path);
        }
    }catch (error: any) {
        throw new Error(`Failed to create/update user:${error.message}`)
    }


}

export async function fetchUser(userId: string) {
    try {
        connectToDB();

        return await User.findOne({ id: userId })
        //     .populate({
        //     path: "communities",
        //     model: Community,
        // });
    } catch (error: any) {
        throw new Error(`Failed to fetch user: ${error.message}`);
    }
}

export async function fetchUserPosts(userId: string) {
    try {
        connectToDB();

        // Find all threads authored by the user with the given userId
        const posts = await User.findOne({ id: userId }).populate({
            path: "posts",
            model: Post,
            populate: [
                // {
                //     path: "community",
                //     model: Community,
                //     select: "name id image _id", // Select the "name" and "_id" fields from the "Community" model
                // },
                {
                    path: "children",
                    model: Post,
                    populate: {
                        path: "author",
                        model: User,
                        select: "name image id", // Select the "name" and "_id" fields from the "User" model
                    },
                },
            ],
        });
        return posts;
    } catch (error) {
        console.error("Error fetching user threads:", error);
        throw error;
    }
}