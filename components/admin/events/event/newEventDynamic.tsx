"use client"

import dynamic from "next/dynamic"
import { LoadingState } from "@/components/ui/loadingState"

// suneditor touches `window` at import time, so the editor must be loaded
// client-side only. The dynamic() call lives at module scope — declaring it
// inside a component body creates a new component type every render, which
// unmounts and remounts the editor (losing state and flashing the UI).
const DynamicNewEvent = dynamic(() => import("./newEvent"), {
    ssr: false,
    loading: () => <LoadingState label="Loading editor…" />
})

const AdminNewEventDynamic = () => <DynamicNewEvent />

export default AdminNewEventDynamic
