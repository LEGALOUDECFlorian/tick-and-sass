// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export type Team = {
	id: number;
	name: string;
	created_at: Date;
	updated_at: Date;
};

export type User = {
	id: number;
	team?: Team;
	name: string;
	email: string;
	password: string;
	created_at: Date;
	updated_at: Date;
};

export type Ticket = {
	id: number;
	team?: Team;
	user?: User;
	tasks?: Array<Task>;
	comments?: Array<Comment>;
	title: string;
	description: string;
	status: number;
	priority: number;
	created_at: Date;
	updated_at: Date;
};

export type Task = {
	id: number;
	ticket?: Ticket;
	status: number;
	title: string;
	description: string;
	created_at: Date;
	updated_at: Date;
};

export type Comment = {
	id: number;
	ticket?: Ticket;
	comment?: Comment;
	user?: User;
	content: string;
	created_at: Date;
	updated_at: Date;
};

export type TicketRelation = {
	id: number;
	ticket?: Ticket;
	relatedTicket?: Ticket;
	created_at: Date;
	updated_at: Date;
};
