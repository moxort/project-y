"use server"

import {connectToDB} from "@/lib/mongoose";
import Post from "@/lib/models/post.model";
import User from "@/lib/models/user.model";
import {revalidatePath} from "next/cache";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;
import Community from "@/lib/models/community.model";

interface PostParams{
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}

export async function fetchPosts(pageNumber = 1, pageSize = 20){
    connectToDB();

    //the number of posts to skip
    const skipAmount = (pageNumber - 1 ) *pageSize
    const postsQuery = Post.find({ parentId: { $in: [null, undefined]}})
        .sort({createdAt: 'desc'})
        .skip(skipAmount)
        .limit(pageSize)
        .populate({
            path: 'author',
            model: User})
        .populate({
            path: "community",
            model: Community,
        })
        .populate({
            path: 'children',
            populate: {
                path: 'author',
                model: User,
                select: "_id name parentId image"
            }
        })

    const totalPostsCount = await Post.countDocuments({ parentId: { $in: [null, undefined]}})

    const posts = await postsQuery.exec()

    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts, isNext}

}

export async function createPost({ text, author, communityId, path }: PostParams){
    try {
        connectToDB();

        const communityIdObject = await Community.findOne(
            { id: communityId },
            { _id: 1 }
        );

        const createdPost = await Post.create({
            text,
            author,
            community: communityIdObject, //communityId if provided, or leave it null for personal account
        });

        await User.findByIdAndUpdate(author, {
            $push: { posts: createdPost._id}
        })

        if (communityIdObject){
            //update community
            await Community.findByIdAndUpdate(communityIdObject, {
                $push: {posts: createdPost._id}
            })
        }

        revalidatePath(path);
    } catch (error: any){
        throw new Error(`Failed to create post: ${error.message}`);
    }

}

async function fetchAllChildPosts(postId: string): Promise<any[]> {
    const childPosts = await Post.find({ parentId: postId });

    const descendantPosts = [];
    for (const childPost of childPosts) {
        const descendants = await fetchAllChildPosts(childPost._id);
        descendantPosts.push(childPost, ...descendants);
    }

    return descendantPosts;
}



export async function fetchPostById(postId: string) {
    connectToDB();

    try {
        const post = await Post.findById(postId)
            .populate({
                path: "author",
                model: User,
                select: "_id id name image",
            })
            .populate({
                path: "community",
                model: Community,
                select: "_id id name image",
            })
            .populate({
                path: "children", // Populate the children field
                populate: [
                    {
                        path: "author", // Populate the author field within children
                        model: User,
                        select: "_id id name parentId image", // Select only _id and username fields of the author
                    },
                    {
                        path: "children", // Populate the children field within children
                        model: Post, // The model of the nested children (assuming it's the same "Post" model)
                        populate: {
                            path: "author", // Populate the author field within nested children
                            model: User,
                            select: "_id id name parentId image", // Select only _id and username fields of the author
                        },
                    },
                ],
            })
            .exec();

        return post;
    } catch (err) {
        console.error("Error while fetching Post:", err);
        throw new Error("Unable to fetch Post");
    }
}

export async function addCommentToPost(postId: string, commentText: string, userId: string, path: string){
    connectToDB();
    
    try {
        const originalPost = await Post.findById(postId);
        if (!originalPost) {
            throw new Error("Post not found");
        }


        const commentPost = new Post({
            text: commentText,
            author: userId,
            parentId: postId, // Set the parentId to the original post's ID
        });

        const savedCommentPost = await commentPost.save();

        originalPost.children.push(savedCommentPost._id)

        await originalPost.save();

        revalidatePath(path);
    } catch (e: any) {
        throw new Error(`Error adding comment to post: ${e.message}`)
    }
}

export async function deletePost(id: string, path: string): Promise<void> {
    try {
        connectToDB();
        const mainPost = await Post.findById(id).populate("author community");

        if (!mainPost) {
            throw new Error("Post not found");
        }

        // Fetch all child  posts  and their descendants recursively
        const descendantPosts = await fetchAllChildPosts(id);

        // Get all descendant post IDs including the main post ID and child post IDs
        const descendantPostIds = [
            id,
            ...descendantPosts.map((thread) => thread._id),
        ];

        // Extract the authorIds and communityIds to update User and Community models respectively
        const uniqueAuthorIds = new Set(
            [
                ...descendantPosts.map((post) => post.author?._id?.toString()), // Use optional chaining to handle possible undefined values
                mainPost.author?._id?.toString(),
            ].filter((id) => id !== undefined)
        );

        const uniqueCommunityIds = new Set(
            [
                ...descendantPosts.map((post) => post.community?._id?.toString()), // Use optional chaining to handle possible undefined values
                mainPost.community?._id?.toString(),
            ].filter((id) => id !== undefined)
        );

        // Recursively delete child posts and their descendants
        await Post.deleteMany({ _id: { $in: descendantPostIds } });

        // Update User model
        await User.updateMany(
            { _id: { $in: Array.from(uniqueAuthorIds) } },
            { $pull: { threads: { $in: descendantPostIds } } }
        );

        // Update Community model
        await Community.updateMany(
            { _id: { $in: Array.from(uniqueCommunityIds) } },
            { $pull: { posts: { $in: descendantPostIds } } }
        );

        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Failed to delete thread: ${error.message}`);
    }
}