'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTemplate } from '@/lib/templates';
import type { ResumeData } from '@/lib/templates/types';
import { createElement } from 'react';

export function TemplatePreviewModal({
	templateId,
	previewData,
	isActive,
	hasActiveDraft,
	onUse,
	onClose,
}: {
	templateId: string;
	previewData: ResumeData;
	isActive: boolean;
	hasActiveDraft: boolean;
	onUse: () => void;
	onClose: () => void;
}) {
	const overlayRef = useRef<HTMLDivElement>(null);
	const tpl = getTemplate(templateId);
	const Component = tpl.component;

	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === 'Escape') onClose();
		}
		document.addEventListener('keydown', handleKey);
		return () => document.removeEventListener('keydown', handleKey);
	}, [onClose]);

	return (
		<div
			ref={overlayRef}
			className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-8"
			onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
		>
			<div className="bg-background rounded-xl shadow-2xl max-w-4xl w-full">
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b">
					<div className="flex items-center gap-2">
						<h2 className="text-lg font-semibold">{tpl.name}</h2>
						{isActive && <Badge variant="secondary">Selected</Badge>}
					</div>
					<div className="flex items-center gap-2">
						{!isActive && hasActiveDraft && (
							<Button size="sm" onClick={onUse}>Use this template</Button>
						)}
						<Button variant="ghost" size="sm" onClick={onClose}>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* Preview */}
				<div className="p-6 flex justify-center bg-muted/30">
					<div
						className="bg-white shadow-lg"
						style={{ width: '793px', minHeight: '1122px' }}
					>
						{createElement(Component, { data: previewData })}
					</div>
				</div>
			</div>
		</div>
	);
}
