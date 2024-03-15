"use server"

import {connectToDB} from "@/lib/mongoose";
import Post from "@/lib/models/post.model";
import User from "@/lib/models/user.model";
import {revalidatePath} from "next/cache";

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