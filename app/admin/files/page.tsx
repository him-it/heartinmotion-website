"use server"

import { getFiles } from "@/actions/volunteer/file"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import AdminFilesList from "@/components/admin/files/filesList"

const Admin_FilesListPage = async () => {
    const fileData = await getFiles()

    return (
        <AdminPageWrapper title="Files" redirect="/admin">
            <AdminFilesList fileData={JSON.parse(JSON.stringify(fileData))}></AdminFilesList>
        </AdminPageWrapper>
    )
}

export default Admin_FilesListPage