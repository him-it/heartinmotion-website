"use client"

import { getPageById, updatePage } from "@/actions/admin/pages/page";
import { Prisma } from "@prisma/client";

import SunEditor from 'suneditor-react';
import SunEditorCore from "suneditor/src/lib/core";
import 'suneditor/dist/css/suneditor.min.css';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { SubmitHandler, useForm } from 'react-hook-form';
import { EditPageSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input'
import { FormSuccess } from '@/components/ui/formSuccess';
import { FormError } from '@/components/ui/formError';
import Home from "@/app/page";

const AdminEditPage = ({ pageData } : { pageData: Prisma.PromiseReturnType<typeof getPageById> | undefined }) => {
    const editor = useRef<SunEditorCore>();

    const [isPending, startTransition] = useTransition()    
    const [error, setError] = useState<string | undefined>('')
    const [success, setSuccess] = useState<string | undefined>('')

    const [homeContent, setHomeContent] = useState<string>('')

    useEffect(() => {
        if(pageData)
            setHomeContent(pageData.content)
    }, [pageData])

    const form = useForm<z.infer<typeof EditPageSchema>>({
        resolver: zodResolver(EditPageSchema),
        defaultValues: {
            path: pageData?.path
        }
    })

    const getSunEditorInstance = (sunEditor: SunEditorCore) => {
        editor.current = sunEditor;
    };

    const onSubmit: SubmitHandler<z.infer<typeof EditPageSchema>> = (data) => {
        startTransition(() => {
            if(pageData)
                updatePage(data, editor.current?.getContents(true), pageData.id)
                    .then((res) => {
                        setError(res.error)
                        setSuccess(res.success)
                    })
                    .catch(() => {
                        setSuccess(undefined)
                        setError("An unexpected error occured.")
                    })
        })
    }

    const homeSubmit: SubmitHandler<z.infer<typeof EditPageSchema>> = (data) => {
        startTransition(() => {
            if(pageData)
                updatePage(data, homeContent, pageData.id)
                    .then((res) => {
                        setError(res.error)
                        setSuccess(res.success)
                    })
                    .catch(() => {
                        setSuccess(undefined)
                        setError("An unexpected error occured.")
                    })
        })
    }
    
    
    return (
        <div className="">
                    { pageData?.title !== "Home" &&
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex justify-center items-center min-h-screen mt-7">
                            <div className='sm:w-[85%] w-[75%]'>
                                <div className='space-y-5'>
                                    <FormField 
                                        control={form.control}
                                        name="path"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Path:</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        {...field}
                                                        type="text"
                                                        disabled={ isPending }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem> 
                                        )}
                                    />
                                    <div className='space-y-2'>
                                        <FormLabel>Content:</FormLabel>
                                        <SunEditor getSunEditorInstance={getSunEditorInstance} height="1000px" disable={ isPending } lang="en" defaultValue={ pageData?.content } setOptions={{
                                                mode: "classic",
                                                rtl: false,
                                                imageWidth: "",
                                                imageHeight: "",
                                                imageSizeOnlyPercentage: true,
                                                imageUploadUrl: "",
                                                imageAccept: "",
                                                    buttonList:  [
                                                    [
                                                        "undo",
                                                        "redo",
                                                        "font",
                                                        "fontSize",
                                                        "formatBlock",
                                                        "paragraphStyle",
                                                        "blockquote",
                                                        "bold",
                                                        "underline",
                                                        "italic",
                                                        "strike",
                                                        "subscript",
                                                        "superscript",
                                                        "fontColor",
                                                        "hiliteColor",
                                                        "textStyle",
                                                        "removeFormat",
                                                        "outdent",
                                                        "indent",
                                                        "align",
                                                        "horizontalRule",
                                                        "list",
                                                        "lineHeight",
                                                        "table",
                                                        "link",
                                                        "image",
                                                        "video",
                                                        "audio",
                                                        "fullScreen",
                                                        "showBlocks",
                                                        "codeView",
                                                        "preview",
                                                        "print"
                                                    ]
                                                ]
                                            }}
                                        />
                                    </div>
                                    { success ? (
                                            <FormSuccess message={ success } />
                                        ) : (
                                            <FormError message={ error } />
                                        )} 
                                    <Button
                                        type="submit"
                                        className='text-white flex w-52 my-8 mx-auto rounded-full bg-red-500 hover:bg-red-600 transition duration-300'
                                        disabled={ isPending }
                                        >
                                            Save
                                    </Button>
                                </div>
                            </div>
                        </div> 
                    </form>
                </Form>   
            }
            {
                pageData?.title === "Home" && 
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(homeSubmit)}>
                        <div className="flex justify-center items-center min-h-screen mt-7">
                            <div className='sm:w-[85%] w-[75%]'>
                                <div className='space-y-5'>
                                    <FormField 
                                        control={form.control}
                                        name="path"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Path:</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        {...field}
                                                        type="text"
                                                        disabled={ isPending }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem> 
                                        )}
                                    />
                                    <div className='space-y-2'>
                                        <FormLabel>Content:</FormLabel>
                                        <textarea 
                                            value={homeContent}
                                            disabled={isPending}
                                            className="w-full min-h-[200px] h-auto"
                                            onChange={(e) => {
                                                setHomeContent(e.target.value)
                                            }}
                                        />
                                    </div>
                                    { success ? (
                                            <FormSuccess message={ success } />
                                        ) : (
                                            <FormError message={ error } />
                                        )} 
                                    <Button
                                        type="submit"
                                        className='text-white flex w-52 my-8 mx-auto rounded-full bg-red-500 hover:bg-red-600 transition duration-300'
                                        disabled={ isPending }
                                        >
                                            Save
                                    </Button>
                                </div>
                            </div>
                        </div> 
                    </form>
                </Form>   
            }
        </div>
    )
}

export default AdminEditPage
