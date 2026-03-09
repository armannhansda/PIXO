-- Posts indexing
CREATE INDEX idx_posts_created_at ON posts (created_at DESC);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_published ON posts(published);

-- likes indexing
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);


-- comments indexing
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments (author_id);


-- followers indexing
CREATE INDEX idx_followers_user_id ON followers(follower_id);
CREATE INDEX idx_followers_following_id ON followers(following_id);

