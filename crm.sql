CREATE DATABASE crm_app;
SHOW DATABASES;

USE crm_app;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    status ENUM('new','contacted','qualified','closed','lost') DEFAULT 'new',
    expected_value DECIMAL(10,2),
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    total_value DECIMAL(10,2) DEFAULT 0,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority ENUM('low','medium','high') DEFAULT 'medium',
    due_date DATE,
    status ENUM('pending','in_progress','completed') DEFAULT 'pending',
    user_id INT,
    client_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

drop table tasks;

CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(255) NOT NULL,
    description TEXT,

    priority ENUM('low','medium','high') DEFAULT 'medium',
    status ENUM('pending','in_progress','completed') DEFAULT 'pending',
    due_date DATE,

    assigned_to INT,
    created_by INT NOT NULL,
    client_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

show tables;

ALTER TABLE leads ADD COLUMN source VARCHAR(50) DEFAULT 'manual';

CREATE TABLE task_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    old_title VARCHAR(255),
    old_description TEXT,
    old_status ENUM('pending','in_progress','completed'),
    old_priority ENUM('low','medium','high'),
    old_due_date DATE,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

ALTER TABLE clients MODIFY lead_id INT NULL;
ALTER TABLE clients add project varchar(255) Not NULL;

SELECT * FROM leads;
SELECT * FROM clients;
SELECT * FROM tasks;
select * from payments;

describe tasks;
describe leads;
SELECT id, name, total_value, user_id FROM clients;
select  sum(total_value) from clients;

ALTER TABLE leads
ADD COLUMN project_info VARCHAR(255),
ADD COLUMN address TEXT,
ADD COLUMN proposal TEXT;

CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  client_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  service_type VARCHAR(100),
  total_amount DECIMAL(12,2) NOT NULL,
  advance_amount DECIMAL(12,2) DEFAULT 0,
  remaining_amount DECIMAL(12,2) DEFAULT 0,
  payment_terms VARCHAR(255),
  status ENUM('active','completed','on_hold') DEFAULT 'active',
  current_phase ENUM('planning','design','development','testing','delivery') DEFAULT 'planning',
  progress_percent INT DEFAULT 0,
  start_date DATE,
  deadline DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);
drop table projects;

ALTER TABLE users 
ADD COLUMN role ENUM('admin','employee') DEFAULT 'admin';

ALTER TABLE clients DROP COLUMN total_value;
ALTER TABLE clients
ADD COLUMN status ENUM('active','inactive','blacklisted') DEFAULT 'active';

ALTER TABLE clients
ADD COLUMN notes TEXT;

ALTER TABLE clients
ADD COLUMN decision ENUM('qualified','not_interested','pending') DEFAULT 'qualified';

ALTER TABLE tasks
ADD COLUMN project_id INT;

ALTER TABLE tasks
ADD CONSTRAINT fk_task_project
FOREIGN KEY (project_id) REFERENCES projects(id)
ON DELETE CASCADE;


ALTER TABLE payments
ADD COLUMN project_id INT;

ALTER TABLE payments
ADD CONSTRAINT fk_project
FOREIGN KEY (project_id) REFERENCES projects(id)
ON DELETE CASCADE;


ALTER TABLE leads
MODIFY COLUMN status ENUM(
  'new',
  'contacted',
  'follow_up',
  'qualified',
  'proposal_sent',
  'negotiation',
  'closed',
  'lost'
) DEFAULT 'new';

ALTER TABLE leads
ADD COLUMN converted_at TIMESTAMP NULL;

UPDATE leads SET status = 'won' WHERE status = 'closed';


describe  leads;
describe clients;
describe payments;
describe users;
describe tasks;

CREATE TABLE lead_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lead_id INT NOT NULL,
  note TEXT NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
)
select * from leads;

ALTER TABLE clients ADD COLUMN total_value DECIMAL(10,2) DEFAULT 0;
ALTER TABLE leads ADD COLUMN converted TINYINT(1) DEFAULT 0;

SELECT id, status, converted FROM leads;

insert into users (name,email,password,role) 
values("Shubhangi Prajapati","bharati.9892@gmail.com","000sachin.@","employee");

ALTER TABLE users 
ADD COLUMN owner_id INT NULL,
ADD FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;

drop table team;