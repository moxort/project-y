"use client"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {usePathname, useRouter} from "next/navigation";
import {useOrganization} from "@clerk/nextjs";
import {useForm} from "react-hook-form";
import * as z from "zod";
import {CommentValidation} from "@/lib/validations/post";
import {zodResolver} from "@hookform/resolvers/zod";
import {Input} from "@/components/ui/input";
import Image from "next/image";
import {addCommentToPost} from "@/lib/actions/post.actions";

interface CommentFormParams{
    postId: string;
    currentUserImg: string;
    currentUserId: string;
}
const Comment = ({postId, currentUserImg, currentUserId}: CommentFormParams) => {
    const router = useRouter();
    const pathname = usePathname();

    const { organization } = useOrganization();

    const form = useForm<z.infer<typeof CommentValidation>>({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            post: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof CommentValidation>) =>{
        await addCommentToPost(
            postId, values.post, JSON.parse(currentUserId), pathname
        );

        form.reset();
    };

    return(
        <Form {...form}>
            <form
                className='comment-form'
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <FormField
                    control={form.control}
                    name='post'
                    render={({ field }) => (
                        <FormItem className='flex w-full items-center gap-3'>
                            <FormLabel>
                                <Image src={currentUserImg} alt="Profile image"
                                 width={48}
                                height={48}
                                className="rounded-full object-cover"/>
                            </FormLabel>
                            <FormControl className='border-none bg-transparent'>
                                <Input
                                    type="text"
                                    placeholder="Comment..."
                                    className="no-focus text-light-1 outline-none"
                                    {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button type='submit' className='comment-form_btn'>
                    Reply
                </Button>
            </form>
        </Form>
    )
}

export default Comment;