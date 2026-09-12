import { notFound } from "next/navigation";
import { headers } from "next/headers";
import ViewTracker from "../../components/ViewTracker";
import PdfViewerWrapper from "../../components/pdf-viewer/PdfViewerWrapper";

const FALLBACK_OG_IMAGE = "/hero.webp";

function buildOgImageUrlFromPdf(fileUrl) {
  if (!fileUrl) return null;

  try {
    const url = new URL(fileUrl);

    if (url.pathname.includes("/raw/upload/")) {
      url.pathname = url.pathname.replace("/raw/upload/", "/image/upload/");
    }

    if (!url.pathname.includes("/upload/")) {
      return fileUrl;
    }

    url.pathname = url.pathname.replace(
      "/upload/",
      "/upload/c_crop,g_north,w_1200,h_630,f_jpg/",
    );
    url.pathname = url.pathname.replace(/\.pdf$/i, ".jpg");

    return url.toString();
  } catch {
    return fileUrl;
  }
}

async function getResumeData(username, slug) {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const url = `${backendUrl}/api/public/${username}/${slug}`;

  try {
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const xForwardedFor = headersList.get("x-forwarded-for") || "";

    const response = await fetch(url, {
      next: { revalidate: 60 },
      headers: {
        "user-agent": userAgent,
        "x-forwarded-for": xForwardedFor,
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch resume data: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching resume data:", error);
    return undefined;
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const username = resolvedParams?.username;
  const slug = resolvedParams?.slug;

  const baseTitle = username ? `${username}'s Resume` : "resumeX";

  if (!username || !slug) {
    return {
      title: baseTitle,
      description: "Professional resume shared via resumeX",
    };
  }

  const resumeData = await getResumeData(username, slug);
  
  if (!resumeData) {
    return {
      title: "Resume Not Found | resumeX",
      description: "The requested resume could not be found.",
    };
  }

  const fullName = resumeData?.user?.name || username;
  const title = `${fullName} | Resume`;
  const description = `View ${fullName}'s resume shared on resumeX.`;
  const ogImage = buildOgImageUrlFromPdf(resumeData?.fileUrl) || FALLBACK_OG_IMAGE;
  const canonicalPath = `/${username}/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalPath,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${fullName} resume preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ResumeSlugPage({ params }) {
  const resolvedParams = await params;
  const username = resolvedParams?.username;
  const slug = resolvedParams?.slug;

  if (!username || !slug) {
    notFound();
  }

  const resumeData = await getResumeData(username, slug);

  if (resumeData === null) {
    notFound();
  }
  
  if (resumeData === undefined) {
    throw new Error("Unable to load this resume.");
  }

  return (
    <div style={{ margin: 0, padding: 0, minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <ViewTracker username={username} slug={slug} />
      <PdfViewerWrapper fileUrl={resumeData.fileUrl} />
    </div>
  );
}
