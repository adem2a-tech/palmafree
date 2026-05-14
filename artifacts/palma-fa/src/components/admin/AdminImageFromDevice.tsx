import React, { useRef, useState } from "react";
import { Loader2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { compressImageFileToDataUrl } from "@/lib/compressImageFile";
import { cn } from "@/lib/utils";

export type AdminImageFromDeviceProps = {
  label?: string;
  value: string;
  onChange: (dataUrlOrEmpty: string) => void;
  /** Mode tableau : mise en page plus compacte */
  compact?: boolean;
  maxEdge?: number;
  quality?: number;
};

export function AdminImageFromDevice({
  label,
  value,
  onChange,
  compact,
  maxEdge,
  quality,
}: AdminImageFromDeviceProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const hasImage = value.trim().length > 0;

  const openPicker = () => inputRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setLoading(true);
    try {
      const dataUrl = await compressImageFileToDataUrl(file, { maxEdge, quality });
      onChange(dataUrl);
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Impossible de traiter l’image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      {label ? <Label>{label}</Label> : null}
      <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={onFile} />
      <div className={cn("flex flex-wrap items-center gap-2", compact && "max-w-[220px] flex-col items-stretch")}>
        <Button
          type="button"
          variant="secondary"
          size={compact ? "sm" : "default"}
          onClick={openPicker}
          disabled={loading}
          className="gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <ImagePlus className="h-4 w-4 shrink-0" />}
          {loading ? "Traitement…" : "Choisir une photo"}
        </Button>
        {hasImage ? (
          <Button
            type="button"
            variant="outline"
            size={compact ? "sm" : "default"}
            onClick={() => onChange("")}
            disabled={loading}
          >
            Retirer l’image
          </Button>
        ) : null}
      </div>
      {hasImage ? (
        <div className="rounded-md border border-border bg-muted/30 p-1">
          <img
            src={value}
            alt=""
            className={cn(
              "rounded object-contain mx-auto",
              compact ? "max-h-20 max-w-full" : "max-h-44 max-w-full",
            )}
          />
        </div>
      ) : null}
    </div>
  );
}
