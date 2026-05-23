'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db/client';
import {
	CreateApplicationSchema,
	UpdateApplicationStatusSchema,
	UpdateExcitementSchema,
	UpdateTrackingSchema,
} from '@/lib/validations/applications';
import type { CreateApplicationInput } from '@/lib/validations/applications';

async function requireAuth(): Promise<string> {
	const session = await auth();
	if (!session && process.env.AUTH_MODE === 'email_otp') redirect('/login');
	return session?.user?.id ?? 'local-user';
}

export async function createApplication(data: CreateApplicationInput): Promise<string> {
	const userId = await requireAuth();
	const validated = CreateApplicationSchema.parse(data);
	try {
		const vacancy = await db.vacancy.create({
			data: {
				userId,
				companyName: validated.companyName,
				jobTitle: validated.jobTitle,
				location: validated.location || null,
				locationType: validated.locationType || null,
				salaryMin: validated.salaryMin ? parseInt(validated.salaryMin, 10) || null : null,
				salaryMax: validated.salaryMax ? parseInt(validated.salaryMax, 10) || null : null,
				currency: validated.currency || 'USD',
				sourceUrl: validated.sourceUrl || null,
				rawText: validated.rawText || null,
			},
		});
		const application = await db.application.create({
			data: { vacancyId: vacancy.id },
		});
		return application.id;
	} catch {
		throw new Error('Failed to create application.');
	} finally {
		revalidatePath('/applications');
	}
}

export async function updateApplicationStatus(
	id: string,
	data: { status: string },
): Promise<void> {
	await requireAuth();
	const validated = UpdateApplicationStatusSchema.parse(data);
	try {
		await db.application.update({ where: { id }, data: { status: validated.status } });
	} catch {
		throw new Error('Failed to update application status.');
	}
	revalidatePath('/applications');
}

export async function updateExcitement(
	id: string,
	data: { excitement: number },
): Promise<void> {
	await requireAuth();
	const validated = UpdateExcitementSchema.parse(data);
	try {
		await db.application.update({ where: { id }, data: { excitement: validated.excitement } });
	} catch {
		throw new Error('Failed to update excitement.');
	}
	revalidatePath('/applications');
}

export async function updateApplicationTracking(
	id: string,
	data: Record<string, unknown>,
): Promise<void> {
	await requireAuth();
	const validated = UpdateTrackingSchema.parse(data);
	try {
		const updateData: Record<string, unknown> = {};
		if (validated.dateApplied !== undefined)
			updateData.dateApplied = validated.dateApplied ? new Date(validated.dateApplied) : null;
		if (validated.deadline !== undefined)
			updateData.deadline = validated.deadline ? new Date(validated.deadline) : null;
		if (validated.followUpDate !== undefined)
			updateData.followUpDate = validated.followUpDate ? new Date(validated.followUpDate) : null;
		if (validated.salaryMin !== undefined) updateData.salaryMin = validated.salaryMin;
		if (validated.salaryMax !== undefined) updateData.salaryMax = validated.salaryMax;
		if (validated.excitement !== undefined) updateData.excitement = validated.excitement;

		await db.application.update({ where: { id }, data: updateData });
	} catch {
		throw new Error('Failed to update tracking fields.');
	}
	revalidatePath('/applications');
	revalidatePath(`/applications/${id}`);
}

export async function deleteApplication(id: string): Promise<void> {
	await requireAuth();
	try {
		const application = await db.application.findUnique({
			where: { id },
			select: { vacancyId: true },
		});
		if (application) {
			await db.application.delete({ where: { id } });
			await db.vacancy.delete({ where: { id: application.vacancyId } });
		}
	} catch {
		throw new Error('Failed to delete application.');
	}
	revalidatePath('/applications');
	redirect('/applications');
}
