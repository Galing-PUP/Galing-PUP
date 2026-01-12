import { Header } from "@/components/header";
import { getCurrentUser } from "@/lib/actions";

export async function HeaderWrapper() {
    const user = await getCurrentUser();

    return <Header initialUser={user} />;
}
