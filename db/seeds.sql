USE employees_db;

INSERT INTO department(`name`)
VALUES
('Billing'), 
('Human Resources'), 
('Sales'),
('Reception'),
('Records'),
('Mail Room');


INSERT INTO `role`(title, salary, department_id)
VALUES
('Billing Agent', 40000, 1), 
('Human Resources Agent', 50000, 2), 
('Sales Agent', 60000, 3),
('Receptionist', 30000, 4),
('Bookkeeper', 35000, 5),
('Mail Clerk', 25000, 6);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES
('Kevin', 'Bacon', 1, NULL), 
('Will', 'Smith', 2, 1), 
('Chris', 'Rock', 3, 2),
('Adam', 'Sandler', 4, 2), 
('Tom', 'Hanks', 6, 4),
('Johnny', 'Depp', 5, 3);

