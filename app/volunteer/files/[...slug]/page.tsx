import { getFileBySlug } from "@/actions/volunteer/file"
import { PageWrapper } from "@/components/pageWrapper"
import { FileDetails } from "@/components/volunteer/fileDetails"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

const FilePage = async ({ params }: { params: Promise<{ slug: string[] }> }) => {
    const { slug } = await params
    const fileData = await getFileBySlug(slug?.[0] ?? '')

    if (!fileData)
        redirect('/volunteer/files')

    return (
        <PageWrapper title={fileData.name}>
            <FileDetails fileData={fileData} />
        </PageWrapper>
    )
}

export default FilePage
