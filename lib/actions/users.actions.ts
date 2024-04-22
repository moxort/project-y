"use server"

import {connectToDB} from "@/lib/mongoose";
import User from "@/lib/models/user.model";
import {revalidatePath} from "next/cache";
import Post from "@/lib/models/post.model";
import {FilterQuery, SortOrder} from "mongoose";
import Community from "@/lib/models/community.model";

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
            .populate({
            path: "communities",
            model: Community,
        });
    } catch (error: any) {
        throw new Error(`Failed to fetch user: ${error.message}`);
    }
}

export async function fetchUserPosts(userId: string) {
    try {
        connectToDB();

        // Find all posts authored by the user with the given userId
        const posts = await User.findOne({ id: userId }).populate({
            path: "posts",
            model: Post,
            populate: [
                {
                    path: "community",
                    model: Community,
                    select: "name id image _id", // Select the "name" and "_id" fields from the "Community" model
                },
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

export async function fetchUsers({
                                     userId,
                                     searchString = "",
                                     pageNumber = 1,
                                     pageSize = 20,
                                     sortBy = "desc",
                                 }: {
    userId: string;
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder;
}) {
    try {
        connectToDB();

        const skipAmount = (pageNumber - 1) * pageSize;

        const regex = new RegExp(searchString, "i");

        const query: FilterQuery<typeof User> = {
            id: { $ne: userId }, // exclude the current user from the results.
        };

        if (searchString.trim() !== "") {
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } },
            ];
        }

        const sortOptions = { createdAt: sortBy };

        const usersQuery = User.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize);


        const totalUsersCount = await User.countDocuments(query);

        const users = await usersQuery.exec();

        //are more users beyond the current page.
        const isNext = totalUsersCount > skipAmount + users.length;

        return { users, isNext };
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
}

export async function getActivity(userId: string) {
    try {
        connectToDB();

        const userPosts = await Post.find({author: userId});

        const childPostIds = userPosts.reduce((acc, userPost) => {
            return acc.concat(userPost.children)
        }, [])

        const replies = await Post.find({
            _id: { $in: childPostIds },
            author: { $ne: userId }, // Exclude posts authored by the same user
        }).populate({
            path: "author",
            model: User,
            select: "name image _id",
        });

        return replies;
    } catch (error: any){
        throw new Error(`Failed to fetch activity: ${error.message}`);
    }
}