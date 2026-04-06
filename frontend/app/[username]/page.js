import PublicResumeClient from "./PublicResumeClient";

const FALLBACK_OG_IMAGE = "/hero.png";

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
      "/upload/pg_1,w_1200,h_630,c_fill,f_jpg/",
    );
    url.pathname = url.pathname.replace(/\.pdf$/i, ".jpg");

    return url.toString();
  } catch {
    return fileUrl;
  }
}

async function getResumeMeta(username) {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const url = `${backendUrl}/api/public/${username}/meta`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const username = resolvedParams?.username;

  const baseTitle = username ? `${username}'s Resume` : "resumeX";

  if (!username) {
    return {
      title: baseTitle,
      description: "Professional resume shared via resumeX",
    };
  }

  const meta = await getResumeMeta(username);
  const fullName = meta?.user?.name || username;
  const title = `${fullName} | Resume`;
  const description = `View ${fullName}'s resume shared on resumeX.`;
  const ogImage = buildOgImageUrlFromPdf(meta?.fileUrl) || FALLBACK_OG_IMAGE;
  const canonicalPath = `/${username}`;

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

export default async function ResumePage({ params }) {
  const resolvedParams = await params;
  const username = resolvedParams?.username;

  return <PublicResumeClient username={username} />;
}
