import { getUserById } from "@/actions/account/user"
import { auth } from "@/auth"
import { EditForm } from "@/components/account/editForm"
import { PageWrapper } from "@/components/pageWrapper"
import { redirect } from "next/navigation"

const EditPage = async () => {
    const session = await auth()

    if (!session?.user?.member_id)
        redirect('/')

    const user = await getUserById(session.user.member_id)

    return (
        <PageWrapper title="Edit">
            <EditForm user={user} />
        </PageWrapper>
    )
}

export default EditPage
