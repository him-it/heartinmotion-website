export const publicRoutes = [
    "/",
    "/about",
    "/home",
    "/volunteer",
    "/volunteer/files",
    "/volunteer/events",
    "/leadership"
]

export const authRoutes = [
    ""
]

export const nonMemberRoutes = [
    "/account/register"
]

export const memberRoutes = [
    "/account/edit",
    "/account/shifts",
    "/account/hours"
]

export const juniorAdminRoutes = [
    "/admin",
    "/admin/members"
]

export const basicAdminRoutes = [
    "/admin/files",
    "/admin/events",
    "/admin/pages"
]

export const superAdminRoutes = [
    "/admin/managers"
]

export const apiAuthPrefix = "/api/auth"

export const DEFAULT_LOGIN_REDIRECT = "/"