import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";
import { RoleName, UserStatus } from "@/lib/generated/prisma/enums";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function main() {
    const email = process.env.OWNER_EMAIL;
    const password = process.env.OWNER_PASSWORD;

    if (!email || !password) {
        console.error("Error: OWNER_EMAIL and OWNER_PASSWORD must be set in .env");
        process.exit(1);
    }

    console.log(`Processing Owner account for: ${email}`);

    const hashedPassword = await hash(password, 10);

    // 1. Sync with Supabase Auth
    let supabaseAuthId: string | null = null;
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
        console.error("Error listing Supabase users:", listError);
        // Proceeding might be risky if we can't check auth, but let's try to proceed with local DB
    }

    const existingAuthUser = users?.find(u => u.email === email);

    if (existingAuthUser) {
        console.log("Supabase Auth user found. Updating password...");
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingAuthUser.id,
            { password: password, email_confirm: true }
        );
        if (updateError) console.error("Failed to update Supabase Auth password:", updateError);
        else supabaseAuthId = existingAuthUser.id;
    } else {
        console.log("Supabase Auth user not found. Creating...");
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: "System Owner",
                role: RoleName.OWNER
            }
        });
        if (createError) {
            console.error("Failed to create Supabase Auth user:", createError);
        } else if (newUser.user) {
            supabaseAuthId = newUser.user.id;
        }
    }

    // 2. Sync with Local DB
    const existingUser = await prisma.user.findUnique({
        where: { email: email },
    });

    if (existingUser) {
        console.log("Owner account exists in DB. Updating...");
        await prisma.user.update({
            where: { email: email },
            data: {
                passwordHash: hashedPassword,
                role: RoleName.OWNER,
                status: UserStatus.APPROVED,
                ...(supabaseAuthId ? { supabaseAuthId: supabaseAuthId } : {}),
            },
        });
        console.log("Owner account updated successfully.");
    } else {
        console.log("Owner account not found in DB. Creating...");
        await prisma.user.create({
            data: {
                email: email,
                username: "System Owner",
                passwordHash: hashedPassword,
                role: RoleName.OWNER,
                status: UserStatus.APPROVED,
                tierId: 2,
                registrationDate: new Date(),
                idNumber: "000000000000",
                ...(supabaseAuthId ? { supabaseAuthId: supabaseAuthId } : {}),
            },
        });
        console.log("Owner account created successfully.");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
