import { getPages } from "@/actions/admin/pages/page";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { TableShell, tdClass, thClass } from "@/components/admin/workbench";

export const AdminPageList = ({ pageData } : { pageData: Prisma.PromiseReturnType<typeof getPages> }) => {
    return (
        <div className="w-full">
            <TableShell>
                <table className="min-w-full table-auto border-collapse">
                    <thead className="bg-muted">
                        <tr>
                            <th className={thClass}>Title</th>
                            <th className={thClass}>Path</th>
                            <th className={thClass + " text-right"}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageData && pageData.map((page, key) => (
                            <tr key={key} className="border-b border-border last:border-0 hover:bg-muted/60 transition-colors">
                                <td className={tdClass + " font-medium"}>{page.title}</td>
                                <td className={tdClass + " text-muted-foreground"}>{page.path}</td>
                                <td className={tdClass + " text-right"}>
                                    <Link href={"/admin/pages/page/" + page.id} className="text-primary hover:text-primary/90 text-sm font-semibold">
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </TableShell>
        </div>
    )
}
