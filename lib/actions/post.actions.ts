"use server"

import {connectToDB} from "@/lib/mongoose";
import Post from "@/lib/models/post.model";
import User from "@/lib/models/user.model";
import {revalidatePath} from "next/cache";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;

interface PostParams{
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}

export async function createPost({ text, author, communityId, path }: PostParams){
    try {
        connectToDB();

        const createdPost = await Post.create({
            text,
            author,
            community:null,
        });

        await User.findByIdAndUpdate(author, {
            $push: { posts: createdPost._id}
        })

        revalidatePath(path);
    } catch (error: any){
        throw new Error(`Failed to create post: ${error.message}`);
    }

}

export async function fetchPosts(pageNumber = 1, pageSize = 20){
    connectToDB();

    //the number of posts to skip
    const skipAmount = (pageNumber - 1 ) *pageSize
    const postsQuery = Post.find({ parentId: { $in: [null, undefined]}})
        .sort({createdAt: 'desc'})
        .skip(skipAmount)
        .limit(pageSize)
        .populate({path: 'author', model: User})
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

export async function fetchPostById(postId: string) {
    connectToDB();

    try {
        const post = await Post.findById(postId)
            .populate({
                path: "author",
                model: User,
                select: "_id id name image",
            })
            // TODO add communities
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
        console.log(originalPost)
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