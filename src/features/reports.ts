export const reportCategories = {
  iluminacao: 'Iluminação',
  vias: 'Ruas e calçadas',
  limpeza: 'Limpeza urbana',
  outros: 'Outros',
} as const;

export type ReportCategory = keyof typeof reportCategories;

export const reportLimits = {
  title: { min: 5, max: 80 },
  public_place: { min: 3, max: 120 },
  description: { min: 10, max: 500 },
};

export type ReportDraft = {
  category: ReportCategory;
  title: string;
  public_place: string;
  description: string;
};

export type Report = ReportDraft & { id: string; created_at: string };

export type Database = {
  public: {
    Tables: {
      reports: {
        Row: Report & { user_id: string };
        Insert: ReportDraft & { id: string };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
  };
};
