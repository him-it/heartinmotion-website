"use client"

import { getFiles } from "@/actions/volunteer/file"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import AdminFilesList from "@/components/admin/files/filesList"
import { Prisma } from "@prisma/client"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

const Admin_FilesListPage = () => {
    const session = useSession();
    const [fileData, setFileData] = useState<Prisma.PromiseReturnType<typeof getFiles>>()
    useEffect(() => {
        const fetchFiles = async () => {
            await getFiles()
            .then((res) => {
                setFileData(res)
            })
        }
        fetchFiles()
    }, [session])

    return (
        <AdminPageWrapper title="Files" redirect="/admin">
            <AdminFilesList fileData={JSON.parse(JSON.stringify(fileData))}></AdminFilesList>
        </AdminPageWrapper>
    )
}

export default Admin_FilesListPage