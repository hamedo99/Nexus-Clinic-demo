export interface DoctorData {
    id: string;
    nameAr: string;
    nameEn?: string;
    titleAr: string;
    titleEn?: string;
    bioAr: string;
    image: string;
    yearsExperience: number;
    rating: number;
    ratingCount: number;
    mapsUrl?: string;
    certificatesList?: any[];
}

export interface BookingConfig {
    workingHours: { start: number; end: number };
    patientsPerHour: number;
    consultationPrice: number;
    slotDuration: number;
    clinic_locations?: any[];
}

export interface WorkingHours {
    start: number;
    end: number;
}

export interface ActionResponse<T = any> {
    success: boolean;
    message?: string;
    error?: string;
    data?: T;
}
