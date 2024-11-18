"use client"

import dynamic from "next/dynamic"

const Admin_NewEventPage = () => {
    const DynamicEditor = dynamic(() => import("@/components/admin/events/event/newEvent"), { ssr: false });
    
    return (
        <DynamicEditor />
    )
}

export default Admin_NewEventPage
