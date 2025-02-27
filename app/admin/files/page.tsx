"use client"

import { getFiles } from "@/actions/volunteer/file"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import AdminFilesList from "@/components/admin/files/filesList"
import { Prisma } from "@prisma/client"
import { useEffect, useState } from "react"

const Admin_FilesListPage = () => {
    const [fileData, setFileData] = useState<Prisma.PromiseReturnType<typeof getFiles>>()
    useEffect(() => {
        const fetchFiles = async () => {
            await getFiles()
            .then((res) => {
                setFileData(res)
            })
        }
        fetchFiles()
    }, [])

    return (
        <AdminPageWrapper title="Files" redirect="/admin">
            <AdminFilesList fileData={fileData ? JSON.parse(JSON.stringify(fileData)) : undefined}></AdminFilesList>
        </AdminPageWrapper>
    )
}

export default Admin_FilesListPage