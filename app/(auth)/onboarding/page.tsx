import AccountProfile from "@/components/forms/AccountProfile";
import {currentUser} from "@clerk/nextjs";
import {User} from "@clerk/backend";

async function Page(){
    const user: User| null = await currentUser()

    const userInfo:any = {};

    const userData: any = {
        id: user?.id,
        objectId: userInfo?._id,
        username: userInfo?.username || user?.username,
        name: userInfo?.name || user?.firstName || "",
        bio: userInfo ? userInfo?.bio : "",
        image: user?.imageUrl

    }

    //todocheck upper code

    console.log(user)
    return (
        <main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-20">
            <h1 className="head-text">Onboarding</h1>
            <p className="mt-3 text-base-regular text-light-2">
                Complete your profile now, to use Project Y.
            </p>

            <section className="mt-9 bg-dark-2 p-10">
                <AccountProfile
                user={userData}
                btnTitle='Continue'/>
            </section>
        </main>
    )
}

export default Page;

// <main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-20">
//     <h1 className="head-text">Onboarding</h1>
//     <p className="mt-3 text-base-regular text-light-2"> Complete your profile now to use Project Y</p>
//     <section className='mt-9 bg-dark-2 p-10'></section>
// </main>