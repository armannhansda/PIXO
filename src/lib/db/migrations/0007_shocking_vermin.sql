DROP INDEX "comments_post_id_idx";--> statement-breakpoint
DROP INDEX "comments_author_id_idx";--> statement-breakpoint
DROP INDEX "followers_follower_id_idx";--> statement-breakpoint
DROP INDEX "followers_following_id_idx";--> statement-breakpoint
DROP INDEX "posts_author_id_idx";--> statement-breakpoint
DROP INDEX "posts_created_at_idx";--> statement-breakpoint
DROP INDEX "posts_published_idx";--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "search_vector" "tsvector";--> statement-breakpoint
CREATE INDEX "idx_comments_post_id" ON "comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_comments_user_id" ON "comments" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_followers_user_id" ON "followers" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "idx_followers_following_id" ON "followers" USING btree ("following_id");--> statement-breakpoint
CREATE INDEX "idx_likes_user_id" ON "likes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_posts_author_id" ON "posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_posts_created_at" ON "posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_posts_published" ON "posts" USING btree ("published");