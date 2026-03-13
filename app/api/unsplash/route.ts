import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// GET — Proxy Unsplash API search
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const query = request.nextUrl.searchParams.get("query");
    if (!query) {
      return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
    }

    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      return NextResponse.json({ error: "Unsplash not configured" }, { status: 500 });
    }

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=9&orientation=squarish`;
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
    });

    if (!res.ok) {
      throw new Error(`Unsplash API error: ${res.status}`);
    }

    const data = await res.json();

    // Return simplified results
    const photos = data.results.map((photo: {
      id: string;
      urls: { small: string; regular: string };
      alt_description: string | null;
      user: { name: string };
    }) => ({
      id: photo.id,
      small: photo.urls.small,
      regular: photo.urls.regular,
      alt: photo.alt_description ?? "Photo",
      credit: photo.user.name,
    }));

    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Unsplash proxy error:", error);
    return NextResponse.json({ error: "Error searching images" }, { status: 500 });
  }
}
