"use client"

import * as z from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {Textarea} from "@/components/ui/textarea";
import {usePathname, useRouter} from "next/navigation";
import {PostValidation} from "@/lib/validations/post";
import {useOrganization} from "@clerk/nextjs";
import {createPost} from "@/lib/actions/post.actions";
function CreatePost({userId}: {userId: string}){

    const router = useRouter();
    const pathname = usePathname();

    const { organization } = useOrganization();

    const form = useForm<z.infer<typeof PostValidation>>({
        resolver: zodResolver(PostValidation),
        defaultValues: {
            post: "",
            accountId: userId,
        },
    });

    const onSubmit = async (values: z.infer<typeof PostValidation>) =>{
         await createPost({
            text: values.post,
            author: userId,
            communityId: organization ? organization.id : null,
            path: pathname,
        });
          // router.push("/")
    };
    return (
        <Form {...form}>
            <form
                className='mt-10 flex flex-col justify-start gap-10'
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <FormField
                    control={form.control}
                    name='post'
                    render={({ field }) => (
                        <FormItem className='flex w-full flex-col gap-3'>
                            <FormLabel className='text-base-semibold text-light-2'>
                                Content
                            </FormLabel>
                            <FormControl className='no-focus border border-dark-4 bg-dark-3 text-light-1'>
                                <Textarea rows={15} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type='submit' className='bg-pink-900'>
                    Create Post
                </Button>
            </form>
        </Form>
    );
}

export default CreatePost