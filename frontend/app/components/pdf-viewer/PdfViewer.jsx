"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Download } from "lucide-react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer({ fileUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = (err) => {
    console.error("PDF Load Error: ", err);
    setError(err);
    setIsLoading(false);
  };

  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }
  }, []);

  useEffect(() => {
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [updateWidth]);

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-[#f9fafb] font-sans pb-24">
      {/* Sleek Minimal Floating Download Button */}
      <div className="fixed bottom-10 right-6 sm:bottom-12 sm:right-10 z-[100]">
        <a
          href={fileUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-12 h-12 bg-gray-900 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          title="Download PDF"
        >
          <Download size={20} strokeWidth={2.5} />
        </a>
      </div>

      <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-2 sm:px-4 sm:pt-6">
        {isLoading && !error && (
          <div className="fixed inset-0 z-10 flex flex-col items-center justify-center w-full h-full pointer-events-none">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-800" />
            <p className="mt-4 text-[10px] font-semibold text-gray-400 tracking-widest uppercase">
              Loading
            </p>
          </div>
        )}

        {error && (
          <div className="fixed inset-0 z-10 flex flex-col items-center justify-center w-full h-full">
            <p className="text-sm font-medium text-red-600">
              Could not load document
            </p>
          </div>
        )}

        <div className="w-full flex flex-col items-center" ref={containerRef}>
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            className="flex flex-col items-center w-full gap-4 sm:gap-8"
          >
            {Array.from(new Array(numPages || 0), (el, index) => (
              <div
                key={`page_${index + 1}`}
                className="w-full bg-white overflow-hidden rounded shadow-sm border border-black/5"
              >
                <Page
                  pageNumber={index + 1}
                  width={containerWidth ? containerWidth : undefined}
                  devicePixelRatio={Math.max(
                    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
                    2
                  )}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  loading={
                    <div className="w-full aspect-[1/1.4] flex items-center justify-center bg-transparent" />
                  }
                />
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}
