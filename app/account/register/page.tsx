"use client"

import { RegisterForm } from "@/components/account/registerForm"
import { PageWrapper } from "@/components/pageWrapper"
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const RegisterPage = () => {
    const session = useSession();
    const [ email, setEmail ] = useState<string>('')

    useEffect(() => {
        if(session.data?.user.email)
            setEmail(session.data.user.email)
    })

    return (
        <PageWrapper title="Register">
            <RegisterForm email={ email } />
        </PageWrapper>
    )
}

export default RegisterPage