-- Seed data for StackIt platform

-- Insert sample users with properly hashed passwords
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@stackit.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('john_doe', 'john@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('jane_smith', 'jane@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('dev_guru', 'guru@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- Insert sample tags
INSERT INTO tags (name, description, usage_count) VALUES
('javascript', 'Questions about JavaScript programming language', 15),
('react', 'Questions about React.js library', 12),
('nodejs', 'Questions about Node.js runtime', 8),
('sql', 'Questions about SQL databases and queries', 10),
('python', 'Questions about Python programming language', 7),
('css', 'Questions about CSS styling', 5),
('html', 'Questions about HTML markup', 4),
('nextjs', 'Questions about Next.js framework', 6);

-- Insert sample questions
INSERT INTO questions (title, description, user_id, status, vote_count, answer_count, view_count) VALUES
('How to join 2 columns in a data set to make a separate column in SQL', 'I do not know the code for it as I am a beginner. As an example what I need to do is like there is a column 1 containing first name and column 2 consists of last name I want a column to combine both names.', 2, 'answered', 5, 2, 45),
('React useState not updating immediately', 'I am having trouble with useState in React. When I call the setter function, the state doesn''t seem to update immediately. How can I fix this?', 3, 'unanswered', 3, 0, 23),
('Best practices for Node.js error handling', 'What are the recommended patterns for handling errors in Node.js applications? Should I use try-catch blocks everywhere?', 4, 'answered', 8, 3, 67),
('CSS Grid vs Flexbox - when to use which?', 'I''m confused about when to use CSS Grid versus Flexbox. Can someone explain the differences and use cases?', 2, 'unanswered', 2, 0, 34),
('How to optimize React performance?', 'My React app is getting slow with large datasets. What are the best practices for optimization?', 3, 'answered', 12, 4, 89),
('PostgreSQL vs MySQL comparison', 'Which database should I choose for my new project? What are the pros and cons of each?', 4, 'unanswered', 6, 1, 56);

-- Insert sample answers
INSERT INTO answers (content, question_id, user_id, is_accepted, vote_count) VALUES
('You can use the CONCAT function or the || operator to combine columns. Here''s an example: <code>SELECT CONCAT(first_name, '' '', last_name) AS full_name FROM users;</code>', 1, 3, true, 8),
('Another approach is to use the + operator in SQL Server: <code>SELECT first_name + '' '' + last_name AS full_name FROM users;</code>', 1, 4, false, 3),
('This is expected behavior in React. State updates are asynchronous. Use useEffect to react to state changes: <code>useEffect(() => { console.log(state); }, [state]);</code>', 2, 4, false, 5),
('For error handling in Node.js, I recommend using a combination of try-catch for async/await and proper error middleware for Express apps.', 3, 2, true, 6),
('You should also consider using libraries like Winston for logging errors and implementing proper error boundaries in your application.', 3, 3, false, 4),
('Use React.memo, useMemo, and useCallback to prevent unnecessary re-renders. Also consider virtualization for large lists.', 5, 2, true, 10),
('Code splitting with React.lazy() and Suspense can also help reduce initial bundle size.', 5, 4, false, 7);

-- Link questions with tags
INSERT INTO question_tags (question_id, tag_id) VALUES
(1, 4), -- SQL question with sql tag
(2, 2), -- React question with react tag
(2, 1), -- React question with javascript tag
(3, 3), -- Node.js question with nodejs tag
(3, 1), -- Node.js question with javascript tag
(4, 6), -- CSS question with css tag
(4, 7), -- CSS question with html tag
(5, 2), -- React optimization with react tag
(5, 1), -- React optimization with javascript tag
(6, 4); -- Database question with sql tag

-- Insert sample votes
INSERT INTO votes (user_id, question_id, vote_type) VALUES
(2, 1, 'upvote'),
(3, 1, 'upvote'),
(4, 1, 'upvote'),
(2, 3, 'upvote'),
(3, 3, 'upvote'),
(2, 5, 'upvote'),
(4, 5, 'upvote');

INSERT INTO votes (user_id, answer_id, vote_type) VALUES
(2, 1, 'upvote'),
(4, 1, 'upvote'),
(2, 2, 'upvote'),
(3, 3, 'upvote'),
(2, 4, 'upvote'),
(3, 6, 'upvote'),
(4, 6, 'upvote');

-- Update accepted answer for questions
UPDATE questions SET accepted_answer_id = 1, status = 'answered' WHERE id = 1;
UPDATE questions SET accepted_answer_id = 4, status = 'answered' WHERE id = 3;
UPDATE questions SET accepted_answer_id = 6, status = 'answered' WHERE id = 5;

-- Insert sample notifications
INSERT INTO notifications (user_id, type, title, message, related_question_id, related_answer_id) VALUES
(2, 'answer', 'New Answer', 'Someone answered your question about SQL joins', 1, 1),
(2, 'answer', 'New Answer', 'Someone answered your question about SQL joins', 1, 2),
(3, 'vote', 'Answer Upvoted', 'Your answer received an upvote', NULL, 3),
(4, 'vote', 'Answer Upvoted', 'Your answer received an upvote', NULL, 1);
