import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { Team, Ticket } from '../../../../app';
import { env as pub } from '$env/dynamic/public';
import { env as priv } from '$env/dynamic/private';

const rawApiUrl = priv.INTERNAL_API_URL ?? pub.PUBLIC_API_URL;
const base = rawApiUrl?.replace(/\/+$/, '') ?? '';
const API_URL = base.endsWith('/graphql') ? base : `${base}/graphql`;

if (!API_URL) {
	throw error(500, 'GraphQL API URL not configured');
}

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

	let json;
	try {
		json = JSON.parse(text);
	} catch {
		console.error('GQL invalid JSON:', text);
		throw new Error('GraphQL response is not valid JSON');
	}

	if (json.errors?.length) {
		console.error('GQL Errors:', json.errors);
		throw new Error(json.errors[0]?.message ?? 'GraphQL query error');
	}
	return json.data;
}

export const load: PageServerLoad = async ({ params, fetch }) => {
	const idRaw = params.id;
	const id = Number.parseInt(idRaw ?? '', 10);
	if (!Number.isInteger(id)) {
		throw error(400, `Invalid ticket id: "${idRaw}"`);
	}

	const query = `
  query TicketAndTeams($id: Int!) {
    ticket(id: $id) {
      id
      title
      description
      status
      priority
      created_at
      user {
        id
        name
        email
      }
      team {
        id
        name
      }
      tasks {
        id
        title
        description
        status
        created_at
      }
      comments {
        id
        content
        created_at
        user {
          id
          name
        }
      }
    }
    teams { id name }
  }
`;

	const data = await postGQL(fetch, query, { id });

	const ticket: Ticket = data?.ticket;
	const teams: Team[] = data?.teams ?? [];
	return { ticket, teams };
};
export const actions: Actions = {
	task_status: async ({ request, fetch }) => {
		const fd = await request.formData();
		const id = Number(fd.get('id'));
		const status = Number(fd.get('status'));

		if (!Number.isInteger(id) || !Number.isInteger(status)) {
			return fail(400, { errors: [{ message: 'id/status invalides (nombres attendus)' }] });
		}
		if (status !== 1 && status !== 2) {
			return fail(400, { errors: [{ message: 'status invalide (attendu: 1 ou 2)' }] });
		}

		const mutation = `
      mutation UpdateTask($data: UpdatedTask!) {
        updateTask(data: $data) { id status }
      }
    `;

		try {
			const data = await postGQL(fetch, mutation, { data: { id, status } });
			if (!data?.updateTask) {
				return fail(400, { errors: [{ message: 'updateTask returned null' }] });
			}
			return { ok: true, task_id: id, status: data.updateTask.status };
		} catch (e: any) {
			console.error('❌ task_status failed:', e);
			return fail(400, { errors: [{ message: e?.message ?? 'UpdateTask failed' }] });
		}
	},

	status: async ({ request, fetch }) => {
		const STATUS_OPEN = 1;
		const STATUS_RESOLVED = 2;
		const form = await request.formData();
		const ticket_id = Number(form.get('ticket_id'));
		const current = form.get('status') != null ? Number(form.get('status')) : null;
		const mode = String(form.get('mode') ?? 'resolve');

		if (!Number.isInteger(ticket_id)) {
			return fail(400, { errors: [{ message: 'ticket_id invalide' }] });
		}

		let nextStatus = STATUS_RESOLVED;
		if (mode === 'toggle' && current != null) {
			nextStatus = current === STATUS_RESOLVED ? STATUS_OPEN : STATUS_RESOLVED;
		} else if (mode === 'open') {
			nextStatus = STATUS_OPEN;
		}

		const mutation = `
      mutation UpdateTicket($data: UpdatedTicket!) {
        updateTicket(data: $data) { id status updated_at }
      }
    `;

		try {
			const data = await postGQL(fetch, mutation, { data: { id: ticket_id, status: nextStatus } });
			if (!data?.updateTicket) {
				return fail(400, { errors: [{ message: 'updateTicket returned null' }] });
			}
			return { ok: true, ticket_id, status: data.updateTicket.status };
			throw redirect(303, '/tickets');
		} catch (e: any) {
			return fail(400, { errors: [{ message: e?.message ?? 'UpdateTicket failed' }] });
		}
	},

	delete: async ({ request, fetch }) => {
		const form = await request.formData();
		const ticket_id = Number(form.get('ticket_id'));
		if (!Number.isInteger(ticket_id)) {
			return fail(400, { errors: [{ message: 'ticket_id invalide' }] });
		}

		const mutation = `
      mutation DeleteTicket($id: Int!) {
        deleteTicket(id: $id) { id }
      }
    `;

		try {
			await postGQL(fetch, mutation, { id: ticket_id });
			throw redirect(303, '/tickets');
		} catch (e: any) {
			throw redirect(303, '/tickets');
		}
	}
};