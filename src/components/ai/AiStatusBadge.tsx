import { Badge } from '@/components/ui/badge';

export function AiStatusBadge({
  configured,
  isDefault,
}: {
  configured: boolean;
  isDefault: boolean;
}) {
  if (isDefault) {
    return <Badge className="bg-blue-100 text-blue-700 border-0 text-[0.65rem]">Default</Badge>;
  }
  if (configured) {
    return (
      <Badge className="bg-green-100 text-green-700 border-0 text-[0.65rem]">Configured</Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground text-[0.65rem]">
      Not configured
    </Badge>
  );
}
