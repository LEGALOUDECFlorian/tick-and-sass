-- SQL Script de génération de données de tests

-- Table teams
CREATE TABLE team (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Fill 20 teams with random names
DO $$
BEGIN
  FOR i IN 1..20 LOOP
    INSERT INTO team (name) VALUES (md5(random()::text));
  END LOOP;
END $$;


-- Table users
CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  team_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Fill 100 users with random names, emails, passwords and team_id
DO $$
BEGIN
  FOR i IN 1..100 LOOP
    INSERT INTO "user" (name, email, password, team_id) VALUES (
      md5(random()::text), 
      md5(random()::text), 
      md5(random()::text), 
      (SELECT id FROM team ORDER BY random() LIMIT 1)
    );
  END LOOP;
END $$;


-- Table tickets
CREATE TABLE ticket (
  id SERIAL PRIMARY KEY,
  team_id INT NOT NULL,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status INT NOT NULL,
  priority INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Fill 10000 tickets with random team_id, user_id, title, description, status and priority. User id must be in the same team as the ticket.
DO $$
BEGIN
  FOR i IN 1..10000 LOOP
    DECLARE
      u_id INT;
      t_id INT;
    BEGIN
      -- Select random user and store user_id and team_id into vars
      SELECT id, team_id INTO u_id, t_id FROM "user" ORDER BY random() LIMIT 1;

      -- Insert ticket
      INSERT INTO ticket (team_id, user_id, title, description, status, priority) VALUES (
        t_id, 
        u_id, 
        md5(random()::text), 
        md5(random()::text), 
        floor(random()*3), 
        floor(random()*3)
      );
    END;
  END LOOP;
END $$;

-- Table comments
CREATE TABLE comment (
  id SERIAL PRIMARY KEY,
  ticket_id INT NOT NULL,
  comment_id INT,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- Fill 50 comments in the first ticket with random user_id, content and comment_id. Comment id will be null for 50% of the comments and will be in the same ticket as the comment.
DO $$
BEGIN
  DECLARE
    t_id INT;
  BEGIN
    -- Select first ticket and store ticket_id and team_id into vars
    SELECT id INTO t_id FROM ticket ORDER BY id LIMIT 1;

    FOR i IN 1..50 LOOP
      DECLARE
        c_id INT;
      BEGIN
        -- Select random comment and store comment_id into vars
        SELECT id INTO c_id FROM comment WHERE ticket_id = t_id ORDER BY random() LIMIT 1;

        -- Insert comment
        INSERT INTO comment (ticket_id, comment_id, user_id, content) VALUES (
          t_id, 
          CASE WHEN random() < 0.5 THEN NULL ELSE c_id END, 
          (SELECT id FROM "user" WHERE team_id = (SELECT team_id FROM ticket WHERE id = t_id) ORDER BY random() LIMIT 1), 
          md5(random()::text)
        );
      END;
    END LOOP;
  END;
END $$;

-- Table tasks
CREATE TABLE task (
  id SERIAL PRIMARY KEY,
  ticket_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Fill 50000 tasks (5 by tickets), title, description and status.
DO $$
BEGIN
  FOR i IN 1..50000 LOOP
    INSERT INTO task (ticket_id, title, description, status) VALUES (
      ((i-1)%10000)+1,
      md5(random()::text), 
      md5(random()::text), 
      floor(random()*3)
    );
  END LOOP;
END $$;

-- Table ticketRelations
CREATE TABLE ticketRelation (
  id SERIAL PRIMARY KEY,
  ticket_id INT NOT NULL,
  related_ticket_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Fill 1000 ticketRelations with random ticket_id and related_ticket_id
DO $$
BEGIN
  FOR i IN 1..1000 LOOP
    INSERT INTO ticketRelation (ticket_id, related_ticket_id) VALUES (
      (SELECT id FROM ticket ORDER BY random() LIMIT 1),
      (SELECT id FROM ticket ORDER BY random() LIMIT 1)
    );
  END LOOP;
END $$;