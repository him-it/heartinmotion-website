import { getPages } from "@/actions/admin/pages/page";
import { Prisma } from "@prisma/client";
import Link from "next/link";

export const AdminPageList = ({ pageData } : { pageData: Prisma.PromiseReturnType<typeof getPages> }) => {
    return (
        <div className="overflow-x-auto p-4">
            <table className="min-w-full table-auto bg-white border-collapse shadow-lg">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Title</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Path</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {pageData && pageData.map((page, key) => (
                        <tr key={key} className="border-b">
                            <td className="px-4 py-2 text-sm text-gray-800">{page.title}</td>
                            <td className="px-4 py-2 text-sm text-gray-800">{page.path}</td>
                            <td className="px-4 py-2">
                                <Link href={"/admin/pages/page/" + page.id} className="text-red-600 hover:text-red-800 text-sm font-semibold">
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