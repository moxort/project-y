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