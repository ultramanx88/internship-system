-- Insert Academic Years
INSERT INTO AcademicYear (id, year, name, startDate, endDate, isActive, createdAt, updatedAt) VALUES 
('year_2024', 2024, 'ปีการศึกษา 2567', '2024-06-01', '2025-05-31', 1, datetime('now'), datetime('now')),
('year_2025', 2025, 'ปีการศึกษา 2568', '2025-06-01', '2026-05-31', 0, datetime('now'), datetime('now'));

-- Insert Semesters
INSERT INTO Semester (id, name, academicYearId, startDate, endDate, isActive, createdAt, updatedAt) VALUES 
('sem_2024_1', 'ภาคเรียนที่ 1', 'year_2024', '2024-06-01', '2024-10-31', 1, datetime('now'), datetime('now')),
('sem_2024_2', 'ภาคเรียนที่ 2', 'year_2024', '2024-11-01', '2025-03-31', 0, datetime('now'), datetime('now')),
('sem_2024_3', 'ภาคเรียนฤดูร้อน', 'year_2024', '2025-04-01', '2025-05-31', 0, datetime('now'), datetime('now')),
('sem_2025_1', 'ภาคเรียนที่ 1', 'year_2025', '2025-06-01', '2025-10-31', 0, datetime('now'), datetime('now')),
('sem_2025_2', 'ภาคเรียนที่ 2', 'year_2025', '2025-11-01', '2026-03-31', 0, datetime('now'), datetime('now')),
('sem_2025_3', 'ภาคเรียนฤดูร้อน', 'year_2025', '2026-04-01', '2026-05-31', 0, datetime('now'), datetime('now'));

-- Insert Admin User
INSERT INTO User (id, email, name, password, roles, isActive, createdAt, updatedAt) VALUES 
('admin_user', 'admin@example.com', 'Admin User', 'admin123', '["admin"]', 1, datetime('now'), datetime('now'));

-- Verify data
SELECT 'Academic Years:' as info;
SELECT * FROM AcademicYear;

SELECT 'Semesters:' as info;
SELECT * FROM Semester;

SELECT 'Users:' as info;
SELECT id, email, name, roles FROM User;
