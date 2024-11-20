import {
    DEFAULT_LOGIN_REDIRECT,
    apiAuthPrefix,
    authRoutes,
    nonMemberRoutes,
    memberRoutes,
    juniorAdminRoutes,
    basicAdminRoutes,
    superAdminRoutes,
    publicRoutes
} from "./routes"

import { auth } from './auth'

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth
    const adminLevel = req.auth?.user.admin_level

    const isApiAuthRoutes = nextUrl.pathname.startsWith(apiAuthPrefix)
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
    const isAuthRoute = authRoutes.includes(nextUrl.pathname)
    
    const isNonMemberRoute = nonMemberRoutes.includes(nextUrl.pathname)
    const isMemberRoute = memberRoutes.includes(nextUrl.pathname)
    const isJuniorAdminRoute = juniorAdminRoutes.includes(nextUrl.pathname)
    const isBasicAdminRoute = basicAdminRoutes.includes(nextUrl.pathname)
    const isSuperAdminRoute = superAdminRoutes.includes(nextUrl.pathname)

    if(isApiAuthRoutes)
        return

    if(isAuthRoute) {
        if(isLoggedIn)
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
        return
    }

    if(isNonMemberRoute) {
        if(!isLoggedIn || adminLevel !== undefined)
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }


    if(isMemberRoute) {
        if(!isLoggedIn || adminLevel === undefined)
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }

    if(isJuniorAdminRoute) {
        if(!isLoggedIn || adminLevel === undefined || adminLevel < 2 )
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
        }
        
    if(isBasicAdminRoute) {
        if(!isLoggedIn || adminLevel === undefined || adminLevel! < 4)
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
        }    
    
    if(isSuperAdminRoute) {
        if(!isLoggedIn || adminLevel === undefined || adminLevel! < 10)
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }

    if(!isLoggedIn && !isPublicRoute)
        if(!nextUrl.pathname.includes('/volunteer/events'))
            return Response.redirect(new URL("/", nextUrl))

    return
})

export const config = { 
    matcher: [
        '/((?!api|_next|.*\\..*).*)'
    ]
 }
