"use client"

import { getPageById } from "@/actions/admin/pages/page"
import { Prisma } from "@prisma/client"
import dynamic from "next/dynamic"
import { LoadingState } from "@/components/ui/loadingState"

// See newEventDynamic.tsx — module-scope dynamic() with ssr:false so the
// suneditor bundle loads client-side once, without remounting per render.
const DynamicEditPage = dynamic(() => import("./editPage"), {
    ssr: false,
    loading: () => <LoadingState label="Loading editor…" />
})

const AdminEditPageDynamic = ({ pageData }: { pageData: Prisma.PromiseReturnType<typeof getPageById> }) => (
    <DynamicEditPage pageData={pageData ?? undefined} />
)

export default AdminEditPageDynamic
