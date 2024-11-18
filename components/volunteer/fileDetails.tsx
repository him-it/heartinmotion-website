import { getFileBySlug } from "@/actions/volunteer/file"
import { Prisma } from "@prisma/client"

export const FileDetails = ({fileData} : {fileData: Prisma.PromiseReturnType<typeof getFileBySlug>}) => {
     
    const bufferToPDF = (arrayBuffer: string | null) => {
        if(arrayBuffer) {
            const buffer = Buffer.isBuffer(arrayBuffer) ? arrayBuffer : Buffer.from(arrayBuffer)
            return "data:application/pdf;base64," + buffer.toString('base64');
        }
    }

    return (
        <div  className="w-full h-screen flex justify-center items-center">
            { fileData && fileData.data &&
                <object 
                    data={bufferToPDF(fileData.data)} 
                    type="application/pdf" 
                    className="w-11/12 h-full">
                    <p className="text-gray-500">Your browser or device does not support PDFs. Please contact support@heartinmotion.org for a waiver.</p>
                </object>
            } 
        </div>
    )
}