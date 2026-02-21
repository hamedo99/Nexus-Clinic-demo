import { AdminSettingsClient } from "@/components/admin-settings-client";
import { SecretarySettingsClient } from "@/components/secretary-settings-client";
import { getSession } from "@/lib/auth";

export default async function SettingsPage() {
    const session: any = await getSession();

    if (session?.role === "ADMIN") {
        return <AdminSettingsClient role={session.role} />;
    }

    return <SecretarySettingsClient role={session?.role} />;
}
