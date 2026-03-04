"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";
import { useCachedData } from "@/hooks/use-cached-data";
import { getPatientsAction, createPatientAction } from "@/features/patients/actions";
import { useState, FormEvent, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function PatientsClient({ initialQuery }: { initialQuery: string }) {
    const [query, setQuery] = useState(initialQuery);
    // Debounce or just use search button? The UI uses a form submit in the original.
    // Let's keep it simple: local state for input, update query on submit.

    // We fetch based on 'query'.
    // Since 'getPatients' is a server action, check if we need to wrap it.
    // getPatients expects a string.
    const fetcher = useCallback(() => getPatientsAction(query), [query]);

    const { data: patients, loading, mutate } = useCachedData<any[]>(
        `patients_${query}`,
        fetcher,
        []
    );

    const [openDialog, setOpenDialog] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const q = formData.get("q") as string;
        setQuery(q);
        // changing query triggers useCachedData to fetch new key
    };

    const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const form = e.currentTarget;
        const formData = new FormData(form);

        // Optimistic Update?
        // We can add a temporary patient to the list if we know the structure.
        const name = formData.get("name") as string;
        const phone = formData.get("phone") as string;

        const tempId = "temp_" + Date.now();
        const tempPatient: any = {
            id: tempId,
            fullName: name,
            phoneNumber: phone,
            createdAt: new Date(),
            updatedAt: new Date(),
            appointments: []
        };

        // Optimistically update the list
        const currentList = patients || [];
        mutate([tempPatient, ...currentList]);
        setOpenDialog(false); // Close immediately for snappiness

        try {
            const res: any = await createPatientAction(null, formData);

            if (res.success && res.data) {
                // We should manually update the cache with the real ID.
                const realPatient = { ...res.data, appointments: [] };
                const updatedList = [realPatient, ...currentList];
                mutate(updatedList);
            } else {
                // Revert
                mutate(currentList);
                alert("Failed: " + res.message);
                setOpenDialog(true);
            }
        } catch (err) {
            mutate(currentList);
            alert("Error creating patient");
            setOpenDialog(true);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">سجل المرضى</h1>
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="ml-2 h-4 w-4" />
                            إضافة مريض جديد
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>إضافة مريض جديد</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">الاسم الثلاثي</Label>
                                <Input id="name" name="name" required placeholder="مثال: أحمد محمد علي" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">رقم الهاتف</Label>
                                <Input id="phone" name="phone" required placeholder="مثال: 07701234567" />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? "جاري الحفظ..." : "حفظ"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search Bar */}
            <Card>
                <CardContent className="p-4">
                    <form className="flex gap-2" onSubmit={handleSearch}>
                        <Input name="q" placeholder="ابحث بالاسم أو رقم الهاتف..." defaultValue={query} className="max-w-md" />
                        <Button type="submit" variant="secondary">
                            <Search className="h-4 w-4" />
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Patients List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading && !patients && (
                    <div className="col-span-full py-10 text-center text-muted-foreground animate-pulse">جاري تحميل بيانات المرضى...</div>
                )}

                {patients && patients.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-muted-foreground flex flex-col items-center gap-2">
                        <Search className="h-10 w-10 text-gray-300" />
                        <p>لا يوجد مرضى مطابقين للبحث {query ? `"${query}"` : ""}</p>
                    </div>
                ) : (
                    patients?.map((patient: any) => (
                        <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary/0 hover:border-l-primary group">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4">
                                        <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-lg font-bold shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                            {patient.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg line-clamp-1">{patient.fullName}</h3>
                                            <p className="text-sm text-gray-500 font-mono mt-1" dir="ltr">{patient.phoneNumber}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between text-sm">
                                    <span className="text-muted-foreground">آخر زيارة:</span>
                                    <span className="font-medium">
                                        {patient.appointments && patient.appointments[0]
                                            ? new Date(patient.appointments[0].startTime).toLocaleDateString('ar-IQ')
                                            : "لا يوجد"}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
