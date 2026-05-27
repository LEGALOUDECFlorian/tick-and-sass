import { KeyValueCache } from "@apollo/utils.keyvaluecache";
import { prisma as DatabaseClient } from "../datasources/prisma";


export interface Team {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  team_id: number;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: number;
  priority: number;
  team_id: number;
  user_id: number;
}

export interface Comment {
  id: number;
  content: string;
  ticket_id: string;
  comment_id: number;
  user_id: number;
  team_id: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  ticket_id: number;
}

export interface TicketRelation {
  id: number;
  ticket_id: number;
  related_ticket_id: number;
}

export interface DBConfig {
  client?: typeof DatabaseClient;
  cache: KeyValueCache;
}

