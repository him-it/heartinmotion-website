"use client";

import { createFile, deleteFilePermanent } from "@/actions/admin/file";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/ui/loadingState";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import "@ungap/with-resolvers";

// @ts-ignore
GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const AdminFilesList = ({ fileData }: { fileData: any[] | undefined }) => {
  const [isPending, startTransition] = useTransition();
  const [fileUpload, setFileUpload] = useState<File>();

  useEffect(() => {
    GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }, []);

  const renderImage = async () => {
    if (fileUpload) {
      const images: any[] = [];
      const pdf = await getDocument(
        new Int8Array(await fileUpload.arrayBuffer())
      ).promise;
      const page = await pdf.getPage(1);
      const canvas = document.createElement("canvas");

      const viewport = page.getViewport({ scale: 1 });
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context!, viewport: viewport })
        .promise;
      images.push(canvas.toDataURL("image/png"));
      canvas.remove();
      return images;
    }
  };

  const bufferToImg = (arrayBuffer: any) => {
    if (!arrayBuffer) return null;

    // Handle Node Buffer
    if (Buffer.isBuffer(arrayBuffer)) {
      return arrayBuffer.toString("base64");
    }

    // Handle plain object with numeric keys (Prisma Bytes)
    if (typeof arrayBuffer === "object") {
      const arr = Object.keys(arrayBuffer)
        .map((k) => arrayBuffer[k])
        .filter((v) => typeof v === "number");
      const buffer = Buffer.from(arr);
      return buffer.toString("base64");
    }

    console.warn("Invalid buffer format:", arrayBuffer);
    return null;
  };

  const deleteFile = (id: number) => {
    if (confirm("Are you sure you want to delete this file?"))
      startTransition(() => {
        deleteFilePermanent(id)
          .then(() => {
            window.location.reload();
          })
          .catch(() => {});
      });
  };

  const uploadFile = async () => {
    if (fileUpload) {
      const name = fileUpload.name.replace(/\s+/g, "_");
      const dispname = fileUpload.name.replace(/[_-]/g, " ");
      const data = await fileUpload.arrayBuffer();
      const size = fileUpload.size;
      const thumbnail = await renderImage();
      createFile(
        name,
        Buffer.from(data).toString("base64"),
        size,
        dispname,
        thumbnail ? thumbnail[0].split(",")[1] : undefined
      ).then(() => {
        window.location.reload();
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <h2 className="text-sm font-semibold mb-4 text-foreground">
          Upload File
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <Label className="block text-sm font-medium text-muted-foreground">
              Choose a file
            </Label>
            <Input
              type="file"
              disabled={isPending}
              accept="application/pdf"
              className="mt-2 w-full"
              onChange={async (e) => {
                const file = e.target.files ? e.target.files[0] : null;
                if (file) {
                  setFileUpload(file);
                }
              }}
            />
          </div>
          <Button
            size="sm"
            disabled={isPending || !fileUpload}
            onClick={() => {
              uploadFile();
            }}
          >
            Upload
          </Button>
        </div>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-11">
        {fileData &&
          fileData.map((file, key) => (
            <div key={key}>
              <div className="relative max-w-xs h-96 w-full rounded-xl border border-border bg-card p-4 shadow-xs hover:shadow-soft text-center transition-shadow duration-300 mx-auto">
                <button
                  onClick={() => {
                    deleteFile(file.id);
                  }}
                  disabled={isPending}
                  aria-label={`Delete ${file.dispname}`}
                  className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
                <Link href={`/volunteer/files/${file.name}`} className="block pt-8">
                  <h1 className="text-lg font-semibold mb-1 text-foreground hover:underline">
                    {file.dispname}
                  </h1>
                  <p className="text-sm text-muted-foreground mb-4">
                    {Math.round((file.size / 1024) * 10) / 10 + " KB"}
                  </p>
                  {file.thumbnail && (
                    <img
                      src={`data:image/png;base64,${bufferToImg(
                        file.thumbnail as any
                      )}`}
                      alt={file.dispname}
                      className="w-full max-h-44 h-56 object-contain rounded-md"
                    />
                  )}
                </Link>
              </div>
            </div>
          ))}
        {!fileData && (
          <div className="col-span-full">
            <LoadingState label="Loading files…" />
          </div>
        )}
      </ul>
    </div>
  );
};

export default AdminFilesList;
