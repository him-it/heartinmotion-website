"use client"

import { DEFAULT_LOGIN_REDIRECT } from "@/routes"
import { signIn, signOut } from "next-auth/react"

export const AuthButton = (props: {action: ("Log In" | "Log Out"), styles: string, status: string}) => {
    const onClick = () => {
        if(props.action === "Log In")
            signIn("google", {
                callbackUrl: DEFAULT_LOGIN_REDIRECT
            })
        else
            signOut()
    }

    return (
        <button className={ props.styles } onClick={ onClick } disabled={ props.status === "loading" ? true : false }>{ props.action }</button>
    )
}