import { getFileBySlug } from "@/actions/volunteer/file";
import { Prisma } from "@prisma/client";

export const FileDetails = ({
  fileData,
}: {
  fileData: Prisma.PromiseReturnType<typeof getFileBySlug>;
}) => {
  const bufferToPDF = (arrayBuffer: any) => {
    if (!arrayBuffer) return null;

    let buffer: Buffer;

    // Node Buffer
    if (Buffer.isBuffer(arrayBuffer)) {
      buffer = arrayBuffer;
    }
    // Plain object with numeric keys (Prisma Bytes)
    else if (typeof arrayBuffer === "object") {
      const arr = Object.keys(arrayBuffer)
        .map((k) => arrayBuffer[k])
        .filter((v) => typeof v === "number");
      buffer = Buffer.from(arr);
    } else {
      console.warn("Invalid PDF buffer format:", arrayBuffer);
      return null;
    }

    return "data:application/pdf;base64," + buffer.toString("base64");
  };

  return (
    <div className="w-full h-screen flex justify-center items-center">
      {fileData && fileData.data && (
        <object
          data={bufferToPDF(fileData.data) ?? ""}
          type="application/pdf"
          className="w-11/12 h-full"
        >
          <p className="text-gray-500">
            Your browser or device does not support PDFs. Please contact
            support@heartinmotion.org for a waiver.
          </p>
        </object>
      )}
    </div>
  );
};
