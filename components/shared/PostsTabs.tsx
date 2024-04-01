import {fetchUserPosts} from "@/lib/actions/users.actions";
import {redirect} from "next/navigation";

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
  let result: Result;

    result = await fetchUserPosts(accountId);

    if(!result) redirect('/')
  
    return(
    <div className="text-light-1">
      User posts
    </div>
    )
}

export default PostsTabs;
