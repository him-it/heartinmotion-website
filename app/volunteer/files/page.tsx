import { getFiles } from "@/actions/volunteer/file"
import { PageWrapper } from "@/components/pageWrapper"
import { FileList } from "@/components/volunteer/fileList"

// Public page with no cookie/header usage — force dynamic rendering so the
// file list is fetched per-request instead of frozen at build time.
export const dynamic = "force-dynamic"

const FilesPage = async () => {
    const fileData = await getFiles()

    return (
        <PageWrapper title="Files">
            <FileList fileData={fileData} />
        </PageWrapper>
    )
}

export default FilesPage
