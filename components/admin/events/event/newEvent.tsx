"use client"

import SunEditor from 'suneditor-react';
import SunEditorCore from "suneditor/src/lib/core";
import 'suneditor/dist/css/suneditor.min.css';
import { useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { SubmitHandler, useForm } from 'react-hook-form';
import { EventSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input'
import { FormSuccess } from '@/components/ui/formSuccess';
import { FormError } from '@/components/ui/formError';
import { AdminFormWrapper } from '../../adminFormWrapper';
import { createEvent } from '@/actions/admin/event';

const AdminNewEvent = () => {
    const editor = useRef<SunEditorCore>();

    const [isPending, startTransition] = useTransition()    
    const [error, setError] = useState<string | undefined>('')
    const [success, setSuccess] = useState<string | undefined>('')

    const form = useForm<z.infer<typeof EventSchema>>({
        resolver: zodResolver(EventSchema),
        defaultValues: {
            name: '',
            hidden: false
        }
    })

    const getSunEditorInstance = (sunEditor: SunEditorCore) => {
        editor.current = sunEditor;
    };

    const onSubmit: SubmitHandler<z.infer<typeof EventSchema>> = (data) => {
        startTransition(() => {
            createEvent(data, editor.current?.getContents(true) ? editor.current?.getContents(true) : '' )
            .then((res) => {
                if(res.error)
                    setError(res.error)
                else
                    window.location.replace("/admin/events")
            })
            .catch(() => {
                setError("An unexpected error occured.")
            })
        })
    }

    return (
        <AdminFormWrapper title="New Event" redirect="/admin/events/">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex justify-center items-center min-h-screen mt-7">
                            <div className='sm:w-[85%] w-[75%]'>
                                <div className='space-y-5'>
                                    <FormField 
                                        control={form.control}
                                        name="name"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Event Name:</FormLabel>
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
                                    <FormField 
                                        control={form.control}
                                        name="hidden"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Hidden to Public:</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        className='w-8'
                                                        {...field}
                                                        type="checkbox"
                                                        value="hidden"
                                                        disabled={ isPending }
                                                        checked={field.value}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem> 
                                        )}
                                    />
                                    <div className='space-y-2'>
                                        <FormLabel>Content:</FormLabel>
                                        <SunEditor getSunEditorInstance={getSunEditorInstance} height="1000px" disable={ isPending } lang="en" setOptions={{
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
                                        className='flex w-52 my-8 mx-auto rounded-full text-white bg-red-500 hover:bg-red-600 transition duration-300'
                                        disabled={ isPending }
                                        >
                                            Create
                                    </Button>
                                </div>
                            </div>
                        </div> 
                    </form>
                </Form>    
        </AdminFormWrapper>
    )
}

export default AdminNewEvent