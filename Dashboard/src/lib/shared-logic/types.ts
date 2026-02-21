export interface DoctorData {
    id: string;
    nameAr: string;
    titleAr: string;
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
