import { prisma } from "@/lib/db";
import { RoleName, UserStatus } from "@/lib/generated/prisma/enums";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requestAccessSchema } from "@/lib/validations/request-access-schema";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ID_UPLOAD_BUCKET = "ID_UPLOAD";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const rawData = {
      username: formData.get("username"),
      college: formData.get("college"),
      email: formData.get("email"),
      idNumber: formData.get("idNumber"),
      password: formData.get("password"),
      confirmPassword: formData.get("password"), // Backend bypass for match check
      idImage: formData.get("idImage"),
    };

    // Validate using shared schema
    const validatedData = requestAccessSchema.parse(rawData);

    const {
      username,
      college,
      email,
      idNumber,
      password,
      idImage: file,
    } = validatedData;

    // 3. User Existence Check
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: email }, // In case they use email as username previously
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // 4. Create User in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Requires admin approval, not email verification
      user_metadata: {
        full_name: username,
        username: email,
      },
    });

    if (authError) {
      console.error("Supabase Auth Creation Error:", authError);
      return NextResponse.json(
        { error: authError.message || "Failed to create authentication account" },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create authentication account" },
        { status: 500 }
      );
    }

    const supabaseAuthId = authData.user.id;

    // 5. File Upload to Supabase
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${idNumber.replace(/\s+/g, "_")}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(ID_UPLOAD_BUCKET)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase Upload Error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload ID image" },
        { status: 500 }
      );
    }

    // 6. Create User in Database
    const hashedPassword = await bcrypt.hash(password, 10);


    const newUser = await prisma.user.create({
      data: {
        email,
        username: username, // Store full name in username field
        supabaseAuthId, // Link to Supabase Auth user
        passwordHash: hashedPassword,
        idNumber: idNumber,
        collegeId: college,
        role: RoleName.ADMIN,
        tierId: 2, // admins usually have paid tier
        registrationDate: new Date(),
        updatedDate: new Date(),
        status: UserStatus.PENDING,
        idImagePath: uploadData.path,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Request submitted successfully",
      userId: newUser.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Request Access Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
