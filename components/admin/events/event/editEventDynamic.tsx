"use client"

import { events_event } from "@prisma/client"
import dynamic from "next/dynamic"
import { LoadingState } from "@/components/ui/loadingState"

// See newEventDynamic.tsx — module-scope dynamic() with ssr:false so the
// suneditor bundle loads client-side once, without remounting per render.
const DynamicEditEvent = dynamic(() => import("./editEvent"), {
    ssr: false,
    loading: () => <LoadingState label="Loading editor…" />
})

const AdminEditEventDynamic = ({ eventData }: { eventData: events_event }) => (
    <DynamicEditEvent eventData={eventData} />
)

export default AdminEditEventDynamic
