import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { prisma } from '@/lib/db';
import { RoleName, UserStatus } from '@/lib/generated/prisma/enums';
import bcrypt from 'bcryptjs';


const ID_UPLOAD_BUCKET = 'ID_UPLOAD';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const fullName = formData.get('fullName') as string;
        const college = formData.get('college') as string; // Ideally this should map to an ID if college is a relation
        const email = formData.get('email') as string;
        const idNumber = formData.get('idNumber') as string;
        const password = formData.get('password') as string;
        const file = formData.get('idImage') as File;

        // 1. Basic Validation
        if (!fullName || !college || !email || !idNumber || !password || !file) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 2. File Validation
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File size exceeds verified limit (5MB)' }, { status: 400 });
        }
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' }, { status: 400 });
        }

        // 3. User Existence Check
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: email } // In case they use email as username previously
                ]
            }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
        }

        // 4. File Upload to Supabase
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${idNumber.replace(/\s+/g, '_')}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from(ID_UPLOAD_BUCKET)
            .upload(fileName, file, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) {
            console.error('Supabase Upload Error:', uploadError);
            return NextResponse.json({ error: 'Failed to upload ID image' }, { status: 500 });
        }

        // 5. Create User in Supabase Auth
        // We use a clean client (simulating public access) to ensure 'signUp' triggers the default email confirmation flow.
        const supabasePublic = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Construct the redirect URL (assuming standard Next.js structure)
        const origin = req.nextUrl.origin;
        const redirectTo = `${origin}/auth/callback`;

        const { data: authData, error: authError } = await supabasePublic.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: redirectTo,
                data: {
                    full_name: fullName,
                    username: email,
                },
            },
        });

        if (authError) {
            console.error('Supabase Auth Signup Error:', authError);
            // Optional: Delete uploaded file if auth fails to avoid orphans
            return NextResponse.json({ error: authError.message || 'Failed to create authentication account' }, { status: 400 });
        }

        if (!authData.user) {
            return NextResponse.json({ error: 'Failed to create authentication account' }, { status: 500 });
        }

        const supabaseAuthId = authData.user.id;

        // 6. Create User in Database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Find college ID based on abbreviation or name from the form
        // The form sends abbreviation e.g., "CCIS". We need the ID.
        // Ensure you have a way to map these. Assuming the form sends the Abbreviation which matches `collegeAbbr` in DB.

        let collegeId: number | null = null;
        if (college) {
            const collegeRecord = await prisma.college.findUnique({
                where: { collegeAbbr: college }
            });
            if (collegeRecord) {
                collegeId = collegeRecord.id;
            } else {
                // Fallback: try finding by name if abbreviation fails or log a warning
                // For now, we will proceed. Depending on requirement, we might want to error out if college is invalid.
                console.warn(`College with abbr ${college} not found.`);
            }
        }

        const newUser = await prisma.user.create({
            data: {
                email,
                username: email, // Using email as username by default for now, or could handle properly
                // Note: fullname is a field we added to schema recently.
                fullname: fullName,
                supabaseAuthId, // Link the Supabase Auth ID
                passwordHash: hashedPassword,
                idNumber: idNumber,
                collegeId: collegeId, // Can be null if not found
                role: RoleName.ADMIN, // Default Role: ADMIN for access requests
                tierId: 1, // Default Tier: 1 (Free) - Assuming 1 is Free based on typical logic, adjust if needed
                registrationDate: new Date(),
                updatedDate: new Date(),
                status: UserStatus.PENDING, // Pending verification
                idImagePath: uploadData.path, // Store the path or ID
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Request submitted successfully',
            userId: newUser.id
        });

    } catch (error) {
        console.error('Request Access Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
