"use client"

import { getFiles } from "@/actions/volunteer/file"
import { Prisma } from "@prisma/client"
import Link from "next/link"


export const FileList = ({fileData} : {fileData: Prisma.PromiseReturnType<typeof getFiles>}) => {

    const bufferToImg = (arrayBuffer: Buffer | null) => {
        if(arrayBuffer) {
            const buffer = Buffer.isBuffer(arrayBuffer) ? arrayBuffer : Buffer.from(arrayBuffer)
            return buffer.toString('base64')
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4">
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {fileData &&
                    fileData.map((file, key) => (
                        <li key={key} className="max-w-xs w-full border p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 mx-auto">
                            <Link href={`/volunteer/files/${file.name}`} className="block">
                                <h1 className="text-xl font-semibold mb-2 text-darkred hover:underline">{file.dispname}</h1>
                                <p className="text-sm text-gray-500 mb-4">{Math.round(file.size / 1024 * 10) / 10 + " KB"}</p>
                                {file.thumbnail && (
                                    <img 
                                        src={`data:image/png;base64,${bufferToImg(file.thumbnail)}`} 
                                        alt={file.dispname} 
                                        className="w-full h-56 object-contain rounded-md"
                                    />
                                )}
                            </Link>
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}