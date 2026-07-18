import { getHours } from "@/actions/account/user"
import { auth } from "@/auth"
import HoursEarned from "@/components/account/hoursEarned"
import { PageWrapper } from "@/components/pageWrapper"
import { redirect } from "next/navigation"

const HoursPage = async () => {
    const session = await auth()

    if (!session?.user?.member_id)
        redirect('/')

    const shiftData = await getHours(session.user.member_id)

    return (
        <PageWrapper title="Hours Earned">
            <HoursEarned shiftData={shiftData} />
        </PageWrapper>
    )
}

export default HoursPage
