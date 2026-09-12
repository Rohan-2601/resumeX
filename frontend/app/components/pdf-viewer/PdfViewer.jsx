"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Download, FileText } from "lucide-react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Use unpkg to load the worker script to avoid Next.js webpack compilation issues
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

  // Responsive width calculation
  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.getBoundingClientRect().width);
    }
  }, []);

  useEffect(() => {
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [updateWidth]);

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-20">
      {/* Premium Sticky Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 sm:px-8 sm:py-4 bg-white/70 backdrop-blur-xl border-b border-black/5 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50/80 text-indigo-600 rounded-xl border border-indigo-100/50">
            <FileText size={18} strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-xs sm:text-sm tracking-[0.15em] text-gray-800 uppercase">
            Document Viewer
          </span>
        </div>
        <a
          href={fileUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-all duration-300 rounded-full shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          <Download size={16} strokeWidth={2.5} />
          <span className="hidden sm:inline">Save PDF</span>
          <span className="sm:hidden">Save</span>
        </a>
      </header>

      <div
        ref={containerRef}
        className="flex flex-col items-center w-full max-w-[900px] mx-auto mt-6 sm:mt-12 px-4 sm:px-8"
      >
        {isLoading && !error && (
          <div className="w-full aspect-[1/1.4] bg-white rounded-md sm:rounded-xl shadow-2xl shadow-black/5 border border-black/5 flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 animate-[pulse_2s_ease-in-out_infinite]" />
            <div className="z-10 flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Loading Pages...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="w-full py-24 bg-white rounded-xl shadow-sm border border-red-100 flex flex-col items-center text-center px-6">
            <p className="text-lg font-semibold text-red-600">
              Unable to load the document.
            </p>
            <p className="mt-2 text-sm text-gray-500 max-w-md">
              Please try refreshing the page. If the problem persists, the file may be corrupted or unavailable.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-8 sm:gap-12 w-full">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            className="flex flex-col items-center w-full gap-8 sm:gap-12"
          >
            {Array.from(new Array(numPages || 0), (el, index) => (
              <div
                key={`page_${index + 1}`}
                className="w-full bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden rounded-sm sm:rounded-md border border-black/5 transition-transform duration-700 hover:scale-[1.002]"
              >
                <Page
                  pageNumber={index + 1}
                  width={containerWidth ? containerWidth : undefined}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  loading={
                    <div className="w-full aspect-[1/1.4] flex items-center justify-center bg-gray-50 animate-pulse">
                      <span className="text-gray-300 text-xs font-semibold tracking-widest uppercase">
                        Loading Page {index + 1}
                      </span>
                    </div>
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
