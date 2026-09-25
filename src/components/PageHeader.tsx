import { ReactNode } from "react";
import { PrintButton } from "@/components/PrintButton";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      <div className="flex items-center gap-2 no-print">
        <PrintButton />
        {actions}
      </div>
    </div>
  );
}
