import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// 서버 사이드에서만 사용하는 Supabase Admin Client (런타임에 생성)
function getSupabaseAdmin(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables");
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Supabase Admin 클라이언트 생성
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const tripId = formData.get("tripId") as string;
    const layoutNumber = formData.get("layoutNumber") as string;

    if (!file || !userId || !tripId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 파일명 생성
    const timestamp = Date.now();
    const fileName = `${userId}/${tripId}_layout${layoutNumber || "1"}_${timestamp}.png`;

    // ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Supabase Storage에 업로드 (서비스 롤 키 사용 - RLS 우회)
    const { error } = await supabaseAdmin.storage
      .from("user-story")
      .upload(fileName, buffer, {
        contentType: "image/png",
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Public URL 생성
    const { data: urlData } = supabaseAdmin.storage
      .from("user-story")
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      publicUrl: urlData.publicUrl,
      fileName: fileName,
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
