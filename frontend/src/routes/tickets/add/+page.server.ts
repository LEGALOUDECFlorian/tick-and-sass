import { apiServer } from '$lib/apiServer';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import type { Team } from '../../../app';

export const load = async () => {
	const query = {
		query: `
			query {
                teams {
                    id
                    name
                }
            }
		`
	};

	try {
		const result = await apiServer(query);
		const teams: Array<Team> = result?.data?.teams ?? [];
		return { teams };
	} catch (e) {
		console.error('Cannot get teams list:', e);
		error(400, 'Cannot get teams list');
	}
};

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		const query = {
			query: `
				mutation CreateTicket($data: CreateTicket!) {
					createTicket(data: $data) {
						id
						title
						description
						priority
						created_at
						updated_at
					}
				}
			`,
			variables: {
				data: {
					team_id: parseInt(data.get('team_id') as string),
					user_id: parseInt(data.get('user_id') as string),
					title: data.get('title'),
					description: data.get('description'),
					status: 1,
					priority: parseInt(data.get('priority') as string)
				}
			}
		};

		const result = await apiServer(query);

		if (result.errors?.length) {
			return fail(400, { errors: result.errors });
		}

		redirect(303, '/tickets');
	}
} satisfies Actions;