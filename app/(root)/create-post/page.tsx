import {currentUser} from "@clerk/nextjs";
import {fetchUser} from "@/lib/actions/users.actions";
import {redirect} from "next/navigation";
import CreatePost from "@/components/forms/CreatePost";

async function Page(){
    const  user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id)

    if (!userInfo.onboarded) redirect('/onboarding')

    return(
    <>
        <h1 className='head-text'>Create Post</h1>
        <CreatePost userId={userInfo._id} />
    </>
    )
}

export default Page;