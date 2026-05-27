import { apiServer } from '$lib/apiServer';
import type { PageLoad } from './$types';
import type { Ticket } from '../../app';

export const load: PageLoad = async ({ url }) => {
	const statusParam = url.searchParams.get('status');
	const teamParam = url.searchParams.get('team_id');
	const userParam = url.searchParams.get('user_id');

	const status = statusParam ? Number(statusParam) : null;
	const team_id = teamParam ? Number(teamParam) : null;
	const user_id = userParam ? Number(userParam) : null;

	const query = `
    query Tickets($limit:Int, $team_id:Int, $user_id:Int, $status:Int) {
      tickets(limit: $limit, team_id: $team_id, user_id: $user_id, status: $status) {
        id
        title
        description
        status
        priority
        created_at
        team { name }
      }
    }
  `;

	const variables = {
		limit: 200,
		team_id,
		user_id,
		status
	};

	try {
		const result = await apiServer({query, variables});
		let tickets = (result?.data?.tickets ?? []) as Array<any>;

		if (tickets.length > 200) tickets = tickets.slice(0, 200);

		return {
			tickets,
			filters: { status, team_id, user_id }
		};
	} catch (e) {
		return { tickets: [], filters: { status, team_id, user_id } };
	}
};