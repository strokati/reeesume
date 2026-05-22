export function PageHeader({
	title,
	description,
	action,
}: {
	title: string;
	description?: string;
	action?: React.ReactNode;
}) {
	return (
		<div className="flex items-start justify-between">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">{title}</h1>
				{description && <p className="mt-1 text-muted-foreground">{description}</p>}
			</div>
			{action && <div>{action}</div>}
		</div>
	);
}
