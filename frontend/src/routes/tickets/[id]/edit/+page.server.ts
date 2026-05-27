import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { env as pub } from '$env/dynamic/public';
import { env as priv } from '$env/dynamic/private';

const rawApiUrl = priv.INTERNAL_API_URL ?? pub.PUBLIC_API_URL;
const base = rawApiUrl?.replace(/\/+$/, '') ?? '';
const API_URL = base.endsWith('/graphql') ? base : `${base}/graphql`;
if (!API_URL) throw error(500, 'GraphQL API URL not configured');

async function postGQL(fetchFn: typeof fetch, query: string, variables?: Record<string, unknown>) {
	const res = await fetchFn(API_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
		body: JSON.stringify({ query, variables })
	});

	const text = await res.text();
	if (!res.ok) {
		console.error('GQL HTTP', res.status, res.statusText, 'Body:', text);
		throw new Error(`GraphQL HTTP ${res.status}: ${text.slice(0, 500)}`);
	}

	let json: any;
	try { json = JSON.parse(text); }
	catch { console.error('GQL invalid JSON:', text); throw new Error('GraphQL response is not valid JSON'); }

	if (json.errors?.length) {
		console.error('GQL Errors:', json.errors);
		throw new Error(json.errors[0]?.message ?? 'GraphQL query error');
	}
	return json.data;
}

export const load: PageServerLoad = async ({ params, fetch }) => {
	const idRaw = params.id;
	const id = Number.parseInt(idRaw ?? '', 10);
	if (!Number.isInteger(id)) throw error(400, `Invalid ticket id: "${idRaw}"`);

	const query = `
    query TicketAndTeams($id: Int!) {
      ticket(id: $id) {
        id
        title
        description
        priority
        status
        user { id name email }
        team { id name }
        tasks { id title status }
      }
      teams { id name }
    }
  `;

	const data = await postGQL(fetch, query, { id });
	const ticket = data?.ticket;
	const teams = data?.teams ?? [];
	if (!ticket) throw error(404, 'Ticket not found');

	return { ticket, teams };
};

export const actions: Actions = {
	default: async ({ request, fetch, url }) => {
		const form = await request.formData();

		const ticket_id = Number(form.get('ticket_id'));
		const user_id   = form.has('user_id') ? Number(form.get('user_id')) : null;
		const team_id   = form.has('team_id') ? Number(form.get('team_id')) : null;
		const title       = form.get('title')?.toString().trim() ?? '';
		const description = form.get('description')?.toString().trim() ?? '';
		const priority    = form.has('priority') ? Number(form.get('priority')) : null;

		if (!Number.isInteger(ticket_id)) {
			return fail(400, { errors: [{ message: 'ticket_id invalide' }] });
		}
		if (!title) {
			return fail(400, { errors: [{ message: 'Le titre est requis' }] });
		}
		if (!description) {
			return fail(400, { errors: [{ message: 'La description est requise' }] });
		}
		if (!Number.isInteger(team_id!)) {
			return fail(400, { errors: [{ message: 'team_id invalide' }] });
		}
		if (!Number.isInteger(user_id!)) {
			return fail(400, { errors: [{ message: 'user_id invalide' }] });
		}
		if (!Number.isInteger(priority!)) {
			return fail(400, { errors: [{ message: 'priority invalide' }] });
		}

		const mutation = `
      mutation UpdateTicket($data: UpdatedTicket!) {
        updateTicket(data: $data) {
          id
          title
          description
          priority
          status
          updated_at
          team { id name }
          user { id name }
        }
      }
    `;

		try {
			const data = await postGQL(fetch, mutation, {
				data: { id: ticket_id, team_id, user_id, title, description, priority }
			});
			if (!data?.updateTicket) {
				return fail(400, { errors: [{ message: 'updateTicket returned null' }] });
			}
		} catch (e: any) {
			return fail(400, { errors: [{ message: e?.message ?? 'UpdateTicket failed' }] });
		}

		throw redirect(303, `/tickets/${ticket_id}`);
	}
};