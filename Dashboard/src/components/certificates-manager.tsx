"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Award } from "lucide-react";

interface Certificate {
  id: string;
  title: string;
  description: string;
  issuer?: string;
  year?: string;
}

interface CertificatesManagerProps {
  value?: Certificate[];
  onChange: (certificates: Certificate[]) => void;
  readOnly?: boolean;
}

export function CertificatesManager({ value = [], onChange, readOnly = false }: CertificatesManagerProps) {
  const [certificates, setCertificates] = useState<Certificate[]>(value);

  const addCertificate = () => {
    const newCertificate: Certificate = {
      id: Math.random().toString(),
      title: "",
      description: "",
      issuer: "",
      year: ""
    };
    const newCertificates = [...certificates, newCertificate];
    setCertificates(newCertificates);
    onChange(newCertificates);
  };

  const removeCertificate = (id: string) => {
    const newCertificates = certificates.filter(cert => cert.id !== id);
    setCertificates(newCertificates);
    onChange(newCertificates);
  };

  const updateCertificate = (id: string, field: keyof Certificate, value: string) => {
    const newCertificates = certificates.map(cert =>
      cert.id === id ? { ...cert, [field]: value } : cert
    );
    setCertificates(newCertificates);
    onChange(newCertificates);
  };

  return (
    <div className="space-y-4">
      {certificates.map((certificate) => (
        <div key={certificate.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 group transition-all hover:shadow-sm">
          <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex justify-center items-center shrink-0 hidden sm:flex">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              value={certificate.title}
              onChange={(e) => updateCertificate(certificate.id, 'title', e.target.value)}
              placeholder="اسم الشهادة *"
              className="bg-white border-slate-200 focus:ring-teal-500 rounded-lg disabled:bg-slate-50 disabled:text-slate-600 disabled:opacity-100"
              disabled={readOnly}
            />
            <Input
              value={certificate.issuer || ""}
              onChange={(e) => updateCertificate(certificate.id, 'issuer', e.target.value)}
              placeholder="الجهة المانحة"
              className="bg-white border-slate-200 focus:ring-teal-500 rounded-lg disabled:bg-slate-50 disabled:text-slate-600 disabled:opacity-100"
              disabled={readOnly}
            />
            <Input
              value={certificate.year || ""}
              onChange={(e) => updateCertificate(certificate.id, 'year', e.target.value)}
              placeholder="السنة (مثال 2020)"
              className="bg-white border-slate-200 focus:ring-teal-500 rounded-lg disabled:bg-slate-50 disabled:text-slate-600 disabled:opacity-100"
              disabled={readOnly}
            />
            <Input
              value={certificate.description}
              onChange={(e) => updateCertificate(certificate.id, 'description', e.target.value)}
              placeholder="وصف (اختياري)"
              className="bg-white border-slate-200 focus:ring-teal-500 rounded-lg disabled:bg-slate-50 disabled:text-slate-600 disabled:opacity-100"
              disabled={readOnly}
            />
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={() => removeCertificate(certificate.id)}
              className="shrink-0 p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
              title="حذف الشهادة"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      ))}

      {!readOnly && (
        <Button
          type="button"
          variant="outline"
          onClick={addCertificate}
          className="w-full border-dashed border-2 border-slate-200 text-slate-500 hover:text-teal-700 hover:border-teal-200 hover:bg-teal-50 bg-transparent rounded-xl py-6"
        >
          <Plus className="h-5 w-5 ml-2" />
          إضافة شهادة جديدة
        </Button>
      )}

      {certificates.length === 0 && (
        <div className="text-center py-6 text-slate-400">
          <p className="text-sm">لم تقم بإضافة أي شهادات بعد.</p>
        </div>
      )}
    </div>
  );
}
