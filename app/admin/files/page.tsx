import { getFiles } from "@/actions/volunteer/file"
import { AdminPageWrapper } from "@/components/admin/adminPageWrapper"
import AdminFilesList from "@/components/admin/files/filesList"

// getFiles is the public (unauthenticated) action, so nothing in this page
// touches cookies — without this, Next would try to prerender it at build
// time, snapshotting the file list (and failing on the binary thumbnails).
export const dynamic = "force-dynamic"

const Admin_FilesListPage = async () => {
    const fileData = await getFiles()

    return (
        <AdminPageWrapper title="Files" redirect="/admin">
            <AdminFilesList fileData={fileData ?? undefined} />
        </AdminPageWrapper>
    )
}

export default Admin_FilesListPage
