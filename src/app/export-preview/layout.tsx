import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Resume Preview' };

export default function ExportPreviewLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<style
				dangerouslySetInnerHTML={{
					__html: `
						.page-break { page-break-before: always; }
						.cover-letter-page { padding: 0.5in; font-family: Georgia, "Times New Roman", serif; font-size: 11pt; line-height: 1.6; color: #1a1a1a; }
						.cover-letter-page p { margin-bottom: 8pt; }
					`,
				}}
			/>
			{children}
		</>
	);
}
