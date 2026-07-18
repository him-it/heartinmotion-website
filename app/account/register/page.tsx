import { auth } from "@/auth"
import { RegisterForm } from "@/components/account/registerForm"
import { PageWrapper } from "@/components/pageWrapper"

const RegisterPage = async () => {
    const session = await auth()
    const email = session?.user?.email ?? ''

    return (
        <PageWrapper title="Register">
            <RegisterForm email={email} />
        </PageWrapper>
    )
}

export default RegisterPage
