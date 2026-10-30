export interface SubmenuItem {
  id: string;
  name: string;
  slug: string;
  href: string;
  description: string;
  badge?: string;
  features: string[];
  tablePreview: {
    tableName: string;
    description: string;
    columns: { name: string; type: string; format?: string }[];
    sampleRows: Record<string, any>[];
  };
}

export interface NavModule {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  badgeCount?: number;
  description: string;
  items: SubmenuItem[];
}

