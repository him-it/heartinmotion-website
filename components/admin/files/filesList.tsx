"use client"

import { createFile, deleteFilePermanent } from "@/actions/admin/file"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState, useTransition } from "react"
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import '@ungap/with-resolvers'

// @ts-ignore
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

const AdminFilesList = ({fileData} : {fileData: any[]}) => {
    const [isPending, startTransition] = useTransition()   
    const [ fileUpload, setFileUpload ] = useState<File>()
    
    const renderImage = async () => {
        if(fileUpload) {
            const images:any[] = []
            const pdf = await getDocument(new Int8Array(await fileUpload.arrayBuffer())).promise
            const page = await pdf.getPage(1)
            const canvas = document.createElement("canvas")

            const viewport = page.getViewport({ scale: 1 })
            const context = canvas.getContext("2d")
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context!, viewport: viewport }).promise
            images.push(canvas.toDataURL("image/png"))
            canvas.remove()
            return images
        }
    }

    const bufferToImg = (arrayBuffer: Buffer | null) => {
        if(arrayBuffer) {
            const buffer = Buffer.isBuffer(arrayBuffer) ? arrayBuffer : Buffer.from(arrayBuffer)
            return buffer.toString('base64')
        }
    }

    const deleteFile = (id: number) => {
        if(confirm("Are you sure you want to delete this file?"))
            startTransition(() => {
                deleteFilePermanent(id)
                .then(() => {
                    window.location.reload()
                })
                .catch(()=> {

                })
            })
    }

    const uploadFile = async () => {
        if(fileUpload) {
            const name = fileUpload.name.replace(/\s+/g, '_')
            const dispname = fileUpload.name.replace(/[_-]/g, ' ')
            const data = await fileUpload.arrayBuffer()
            const size = fileUpload.size
            const thumbnail = await renderImage()
            createFile(name, Buffer.from(data).toString('base64'), size, dispname, thumbnail ? thumbnail[0].split(',')[1] : undefined)
                .then(() => {
                    window.location.reload()
                })
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Upload File</h2>
                <div className="space-y-4">
                    <div>
                        <Label className="block text-sm font-medium text-gray-600">Choose a file</Label>
                        <Input 
                            type="file"
                            disabled={isPending}
                            accept="application/pdf"
                            className="mt-2 p-2 border border-gray-300 rounded-md w-full"
                            onChange={async (e) => {
                                const file = e.target.files ? e.target.files[0] : null;                 
                                if (file) {
                                    setFileUpload(file)
                                }
                            }}
                        />
                    </div>
                    <Button className="mt-4 px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-300" disabled={isPending}
                        onClick={() => {
                            uploadFile()
                        }}
                    >
                        Upload
                    </Button>
                </div>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-11">
                {fileData &&
                    fileData.map((file, key) => (
                        <div key={key}>                        
                            <div className="max-w-xs h-96 w-full border p-4 rounded-lg shadow-lg hover:shadow-xl text-center transition-shadow duration-300 mx-auto">
                                <div className="flex justify-center mb-4 mt-2">
                                    <button 
                                        onClick={() => {
                                            deleteFile(file.id)
                                        }} 
                                        disabled={isPending}
                                        className="w-2/6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-200 text-center">
                                        Delete
                                    </button>
                                </div>
                                <Link href={`/volunteer/files/${file.name}`} className="block">
                                <h1 className="text-xl font-semibold mb-2 text-darkred hover:underline">{file.dispname}</h1>
                                <p className="text-sm text-gray-500 mb-4">{Math.round(file.size / 1024 * 10) / 10 + " KB"}</p>
                                {file.thumbnail && (
                                    <img
                                    src={`data:image/png;base64,${bufferToImg(file.thumbnail)}`}
                                    alt={file.dispname}
                                    className="w-full max-h-44 h-56 object-contain rounded-md"
                                    />
                                )}
                                </Link>
                    
                            </div>
                      </div>
                    ))
                }
            </ul>
        </div>
    )
}

export default AdminFilesList