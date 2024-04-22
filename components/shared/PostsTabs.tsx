import {fetchUserPosts} from "@/lib/actions/users.actions";
import {redirect} from "next/navigation";
import PostCard from "@/components/cards/PostCard";
import {fetchCommunityPosts} from "@/lib/actions/community.actions";

interface Result {
  name: string;
  image: string;
  id: string;
  posts: {
    _id: string;
    text: string;
    parentId: string | null;
    author: {
      name: string;
      image: string;
      id: string;
    };
    community: {
      id: string;
      name: string;
      image: string;
    } | null;
    createdAt: string;
    children: {
      author: {
        image: string;
      };
    }[];
  }[];
}
interface PostsTabParams {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

async function PostsTabs({ currentUserId, accountId, accountType }: PostsTabParams) {
  let result: any;

  if (accountType === 'Community') {
    result = await fetchCommunityPosts(accountId);

  } else{
    result = await fetchUserPosts(accountId);
  }

    if(!result) redirect('/')

    return(
    <div className="mt-9 flex flex-col gap-10">
      {result.posts.map((post:any) => (
        <PostCard
            key={post._id}
            id={post._id}
            currentUserId={currentUserId}
            parentId={post.parentId}
            content={post.text}
            author={accountType ==='User' ? {name: result.name, image: result.image, id: result.id}
        : { name: post.author.name, image: post.author.image, id: post.author.id}} //todo
            community={post.community} //todo
            createdAt={post.createdAt}
            comments={post.children}
        />
      ))}

    </div>
    )
}

export default PostsTabs;
