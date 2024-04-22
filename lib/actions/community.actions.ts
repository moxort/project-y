"use server";

import { FilterQuery, SortOrder } from "mongoose";

import Community from "../models/community.model";
import Post from "../models/post.model";
import User from "../models/user.model";

import { connectToDB } from "../mongoose";

export async function createCommunity(
    id: string,
    name: string,
    username: string,
    image: string,
    bio: string,
    createdById: string
) {
    try {
        connectToDB();

        const user = await User.findOne({ id: createdById });

        if (!user) {
            throw new Error("User not found");
        }

        const newCommunity = new Community({
            id,
            name,
            username,
            image,
            bio,
            createdBy: user._id, // Use the mongoose ID of the user
        });

        const createdCommunity = await newCommunity.save();

        user.communities.push(createdCommunity._id);
        await user.save();

        return createdCommunity;
    } catch (error) {
        console.error("Error creating community:", error);
        throw error;
    }
}

export async function fetchCommunityDetails(id: string) {
    try {
        connectToDB();

        const communityDetails = await Community.findOne({ id }).populate([
            "createdBy",
            {
                path: "members",
                model: User,
                select: "name username image _id id",
            },
        ]);

        return communityDetails;
    } catch (error) {
        // Handle any errors
        console.error("Error fetching community details:", error);
        throw error;
    }
}

export async function fetchCommunityPosts(id: string) {
    try {
        connectToDB();

        console.log("ID HERE", id)
        const communityPosts = await Community.findOne({id: id}).populate({
            path: "posts",
            model: Post,
            populate: [
                {
                    path: "author",
                    model: User,
                    select: "name image id",
                },
                {
                    path: "children",
                    model: Post,
                    populate: {
                        path: "author",
                        model: User,
                        select: "image _id",
                    },
                },
            ],
        });

        return communityPosts;
    } catch (error) {
        // Handle any errors
        console.error("Error fetching community posts:", error);
        throw error;
    }
}

export async function fetchCommunities({
                                           searchString = "",
                                           pageNumber = 1,
                                           pageSize = 20,
                                           sortBy = "desc",
                                       }: {
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder;
}) {
    try {
        connectToDB();

        const skipAmount = (pageNumber - 1) * pageSize;

        const regex = new RegExp(searchString, "i");

        const query: FilterQuery<typeof Community> = {};

        // if the search string is not empty, add $or operator to match either username or name fields.
        if (searchString.trim() !== "") {
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } },
            ];
        }

        // the sort options for the fetched communities based on createdAt field and provided sort order.
        const sortOptions = { createdAt: sortBy };

        // query to fetch the communities based on the search and sort criteria.
        const communitiesQuery = Community.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize)
            .populate("members");

        // total number of communities that match the search criteria (without pagination).
        const totalCommunitiesCount = await Community.countDocuments(query);

        const communities = await communitiesQuery.exec();

        //if there are more communities beyond the current page.
        const isNext = totalCommunitiesCount > skipAmount + communities.length;

        return { communities, isNext };
    } catch (error) {
        console.error("Error fetching communities:", error);
        throw error;
    }
}

export async function addMemberToCommunity(
    communityId: string,
    memberId: string
) {
    try {
        connectToDB();

        const community = await Community.findOne({ id: communityId });

        if (!community) {
            throw new Error("Community not found");
        }

        const user = await User.findOne({ id: memberId });

        if (!user) {
            throw new Error("User not found");
        }

        // if the user is already a member of the community
        if (community.members.includes(user._id)) {
            throw new Error("User is already a member of the community");
        }

        community.members.push(user._id);
        await community.save();

        user.communities.push(community._id);
        await user.save();

        return community;
    } catch (error) {
        console.error("Error adding member to community:", error);
        throw error;
    }
}

export async function removeUserFromCommunity(
    userId: string,
    communityId: string
) {
    try {
        connectToDB();

        const userIdObject = await User.findOne({ id: userId }, { _id: 1 });
        const communityIdObject = await Community.findOne(
            { id: communityId },
            { _id: 1 }
        );

        if (!userIdObject) {
            throw new Error("User not found");
        }

        if (!communityIdObject) {
            throw new Error("Community not found");
        }

        // remove the user's _id from the members array in the community
        await Community.updateOne(
            { _id: communityIdObject._id },
            { $pull: { members: userIdObject._id } }
        );

        // remove the community's _id from the communities array in the user
        await User.updateOne(
            { _id: userIdObject._id },
            { $pull: { communities: communityIdObject._id } }
        );

        return { success: true };
    } catch (error) {
        console.error("Error removing user from community:", error);
        throw error;
    }
}

export async function updateCommunityInfo(
    communityId: string,
    name: string,
    username: string,
    image: string
) {
    try {
        connectToDB();

        // find the community by its _id and update the information
        const updatedCommunity = await Community.findOneAndUpdate(
            { id: communityId },
            { name, username, image }
        );

        if (!updatedCommunity) {
            throw new Error("Community not found");
        }

        return updatedCommunity;
    } catch (error) {
        console.error("Error updating community information:", error);
        throw error;
    }
}

export async function deleteCommunity(communityId: string) {
    try {
        connectToDB();

        // find the community by its ID and delete it
        const deletedCommunity = await Community.findOneAndDelete({
            id: communityId,
        });

        if (!deletedCommunity) {
            throw new Error("Community not found");
        }

        // delete all posts associated with the community
        await Post.deleteMany({ community: communityId });

        // find all users who are part of the community
        const communityUsers = await User.find({ communities: communityId });

        // remove the community from the 'communities' array for each user
        const updateUserPromises = communityUsers.map((user) => {
            user.communities.pull(communityId);
            return user.save();
        });

        await Promise.all(updateUserPromises);

        return deletedCommunity;
    } catch (error) {
        console.error("Error deleting community: ", error);
        throw error;
    }
}