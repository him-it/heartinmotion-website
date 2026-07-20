import { AdminPageWrapper } from "@/components/admin/adminPageWrapper";
import AdminEventReports from "@/components/admin/events/reports/eventReports";

const Admin_EventReportsPage = async () => {

    return(
        <AdminPageWrapper title="Event Reports" redirect="/admin/events" width="max-w-2xl">
            <AdminEventReports/>
        </AdminPageWrapper>
    )
}

export default Admin_EventReportsPage