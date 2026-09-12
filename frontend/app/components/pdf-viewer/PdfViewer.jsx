"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
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
    <div
      ref={containerRef}
      className="flex flex-col items-center w-full max-w-4xl mx-auto min-h-screen pb-16"
    >
      {isLoading && !error && (
        <div className="flex flex-col items-center justify-center w-full mt-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-800" />
          <p className="mt-4 text-sm font-medium text-gray-500">
            Loading resume...
          </p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center w-full mt-24 text-center px-4">
          <p className="text-lg font-semibold text-red-600">
            Unable to load the resume.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Please try refreshing the page. If the problem persists, the file may be unavailable.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-6 w-full shadow-sm mt-4 md:mt-8">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          className="flex flex-col items-center w-full gap-4 md:gap-8"
        >
          {Array.from(new Array(numPages || 0), (el, index) => (
            <div
              key={`page_${index + 1}`}
              className="w-full bg-white shadow-md overflow-hidden rounded-md md:rounded-xl"
            >
              <Page
                pageNumber={index + 1}
                width={containerWidth ? containerWidth : undefined}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                loading={
                  <div className="w-full h-96 flex items-center justify-center bg-gray-50 animate-pulse">
                    <span className="text-gray-400 text-sm">Loading page {index + 1}...</span>
                  </div>
                }
              />
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
}
