import { getPages } from "@/actions/admin/pages/page";
import { Prisma } from "@prisma/client";
import Link from "next/link";

export const AdminPageList = ({ pageData } : { pageData: Prisma.PromiseReturnType<typeof getPages> }) => {
    return (
        <div className="overflow-x-auto p-4">
            <table className="min-w-full table-auto bg-card border-collapse">
                <thead className="bg-muted">
                    <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">Title</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">Path</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {pageData && pageData.map((page, key) => (
                        <tr key={key} className="border-b">
                            <td className="px-4 py-2 text-sm text-foreground">{page.title}</td>
                            <td className="px-4 py-2 text-sm text-foreground">{page.path}</td>
                            <td className="px-4 py-2">
                                <Link href={"/admin/pages/page/" + page.id} className="text-primary hover:text-primary/90 text-sm font-semibold">
                                    Edit
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}