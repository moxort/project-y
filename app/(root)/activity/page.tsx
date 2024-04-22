import {currentUser} from "@clerk/nextjs";
import {fetchUser, getActivity} from "@/lib/actions/users.actions";
import {redirect} from "next/navigation";
import Link from "next/link";
import Image from "next/image";


async function Page() {
    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");

    const activity = await getActivity(userInfo._id)

    console.log("ACTIVITY", activity)
    return (
        <section>
            <h1 className="head-text mb-10">Activity</h1>

            <section className="mt-10 flex flex-col gap-5">
                {activity.length > 0 ? (
                    <>
                        {activity.map((activity) => (
                            <Link
                            key={activity._id}
                            href={`post/${activity.parentId}`}>
                                <article className="activity-card">
                                    <Image
                                    src={activity.author.image}
                                    alt="Profile picture"
                                    width={20}
                                    height={20}
                                    className="reunded-full object-cover"
                                    />
                                    <p className="!text-small-regular text-light-1">
                                        <span className="mr-1 text-primary-500">
                                            {activity.author.name}
                                        </span>{" "}
                                        replied to your post
                                    </p>
                                </article>
                            </Link>
                        ))}
                    </>
                ) : <p className='!text-base-regular text-light-3'>No activity yet</p>}
            </section>
        </section>
    )
}

export default Page