"use server"

import { getFiles } from "@/actions/volunteer/file"
import { PageWrapper } from "@/components/pageWrapper"
import { FileList } from "@/components/volunteer/fileList"

const FilesPage = async () => {
    const fileData = await getFiles()

    return (
        <PageWrapper title="Files">
            <FileList fileData={JSON.parse(JSON.stringify(fileData))}></FileList>
        </PageWrapper>
    )
}

export default FilesPage