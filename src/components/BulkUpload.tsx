import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { AlertCircle, Download, FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export interface BulkUploadField {
  key: string;
  label: string;
  required?: boolean;
}

export interface BulkUploadResult {
  imported: number;
  skipped?: number;
  errors?: string[];
}

interface BulkUploadProps {
  title: string;
  description?: string;
  fields: BulkUploadField[];
  sampleRows: Record<string, string>[];
  onImport: (rows: Record<string, string>[]) => BulkUploadResult;
  triggerLabel?: string;
}

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const BulkUpload = ({ title, description, fields, sampleRows, onImport, triggerLabel = "Import" }: BulkUploadProps) => {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [rowErrors, setRowErrors] = useState<string[]>([]);
  const [isReading, setIsReading] = useState(false);

  const fieldLookup = useMemo(() => {
    const lookup: Record<string, string> = {};
    fields.forEach(field => {
      lookup[normalize(field.key)] = field.key;
      lookup[normalize(field.label)] = field.key;
    });
    return lookup;
  }, [fields]);

  const reset = () => {
    setRows([]);
    setFileName("");
    setParseError("");
    setRowErrors([]);
  };

  const openSheet = () => {
    reset();
    setOpen(true);
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    setIsReading(true);
    setParseError("");
    setRowErrors([]);
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!firstSheet) throw new Error("The file does not contain a worksheet.");
      const sourceRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: "", raw: false });
      const mappedRows = sourceRows.map(sourceRow => {
        const row: Record<string, string> = {};
        Object.entries(sourceRow).forEach(([header, value]) => {
          const key = fieldLookup[normalize(header)];
          if (key) row[key] = String(value ?? "").trim();
        });
        return row;
      });
      if (mappedRows.length === 0) throw new Error("No data rows were found. Use the template headings.");
      const errors: string[] = [];
      mappedRows.forEach((row, index) => {
        fields.filter(field => field.required && !row[field.key]).forEach(field => {
          errors.push(`Row ${index + 2}: ${field.label} is required`);
        });
      });
      setRows(mappedRows);
      setRowErrors(errors);
      setFileName(file.name);
    } catch (error) {
      setRows([]);
      setFileName("");
      setParseError(error instanceof Error ? error.message : "Could not read this file.");
    } finally {
      setIsReading(false);
    }
  };

  const downloadTemplate = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(sampleRows.length > 0 ? sampleRows : [Object.fromEntries(fields.map(field => [field.key, ""]))]);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Import Template");
    XLSX.writeFile(workbook, `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-template.xlsx`);
  };

  const handleImport = () => {
    if (rows.length === 0) {
      toast.error("Choose a CSV or Excel file first");
      return;
    }
    const result = onImport(rows);
    setRowErrors(result.errors || []);
    if (result.imported > 0) {
      toast.success(`${result.imported} ${title.toLowerCase()} imported${result.skipped ? `, ${result.skipped} skipped` : ""}`);
      setOpen(false);
    } else if (result.errors?.length) {
      toast.error("Nothing was imported. Review the row errors.");
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={openSheet}>
        <Upload className="h-4 w-4" /> {triggerLabel}
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5" /> Bulk import {title}</SheetTitle>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </SheetHeader>

          <div className="space-y-5 mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4" /> Download template
              </Button>
              <span className="text-xs text-muted-foreground">CSV, XLSX, and XLS files are supported.</span>
            </div>

            <div className="rounded-lg border border-dashed p-4 space-y-2">
              <label className="text-sm font-medium" htmlFor="bulk-upload-file">Choose file</label>
              <input
                id="bulk-upload-file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={event => { void handleFile(event.target.files?.[0]); }}
                className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium"
              />
              {isReading && <p className="text-xs text-muted-foreground">Reading file…</p>}
              {fileName && <Badge variant="secondary">{fileName} · {rows.length} rows</Badge>}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Required and accepted columns</p>
              <div className="flex flex-wrap gap-1.5">
                {fields.map(field => <Badge key={field.key} variant={field.required ? "default" : "outline"} className="text-[10px]">{field.label}{field.required ? " *" : ""}</Badge>)}
              </div>
            </div>

            {(parseError || rowErrors.length > 0) && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive space-y-1">
                {parseError && <p className="flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {parseError}</p>}
                {rowErrors.slice(0, 12).map(error => <p key={error}>{error}</p>)}
                {rowErrors.length > 12 && <p>And {rowErrors.length - 12} more row errors.</p>}
              </div>
            )}

            {rows.length > 0 && (
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Row</TableHead>{fields.slice(0, 6).map(field => <TableHead key={field.key}>{field.label}</TableHead>)}</TableRow></TableHeader>
                  <TableBody>
                    {rows.slice(0, 8).map((row, index) => <TableRow key={index}><TableCell className="text-xs text-muted-foreground">{index + 2}</TableCell>{fields.slice(0, 6).map(field => <TableCell key={field.key} className="max-w-40 truncate text-xs">{row[field.key] || "—"}</TableCell>)}</TableRow>)}
                  </TableBody>
                </Table>
                {rows.length > 8 && <p className="px-3 py-2 text-xs text-muted-foreground">Showing the first 8 of {rows.length} rows.</p>}
              </div>
            )}
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleImport} disabled={isReading || rows.length === 0}>Import {rows.length > 0 ? `${rows.length} rows` : "rows"}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default BulkUpload;