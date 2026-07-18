import { getRegisteredShifts } from "@/actions/account/user"
import { auth } from "@/auth"
import RegisteredShifts from "@/components/account/registeredShifts"
import { PageWrapper } from "@/components/pageWrapper"
import { redirect } from "next/navigation"

const ShiftsPage = async () => {
    const session = await auth()

    if (!session?.user?.member_id)
        redirect('/')

    const shiftData = await getRegisteredShifts(session.user.member_id)

    return (
        <PageWrapper title="Registered Shifts">
            <RegisteredShifts shiftData={shiftData} />
        </PageWrapper>
    )
}

export default ShiftsPage
