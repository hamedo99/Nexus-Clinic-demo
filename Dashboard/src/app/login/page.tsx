"use client";

import { useActionState } from "react";
import { login } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { useFormStatus } from "react-dom";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "جاري الدخول..." : "تسجيل الدخول"}
        </Button>
    );
}

export default function LoginPage() {
    const [state, formAction] = useActionState(login, null);

    return (
        <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen items-center justify-center p-4" dir="rtl">
            <Card className="w-full max-w-sm shadow-xl border-t-4 border-primary/80">
                <CardHeader className="text-center space-y-1">
                    <CardTitle className="text-2xl font-bold">بوابة الدخول</CardTitle>
                    <CardDescription>أدخل بياناتك للمتابعة إلى لوحة التحكم</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2 text-right">
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="admin@nexus.clinic"
                                required
                                className="text-right"
                            />
                        </div>
                        <div className="space-y-2 text-right">
                            <Label htmlFor="password">كلمة المرور</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="text-right"
                            />
                        </div>

                        {state?.error && (
                            <p className="text-sm font-medium text-red-500 text-center">
                                {state.error}
                            </p>
                        )}

                        <SubmitButton />
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-xs text-muted-foreground">نظام نيكسوس الطبي © 2026</p>
                </CardFooter>
            </Card>
        </div>
    );
}
