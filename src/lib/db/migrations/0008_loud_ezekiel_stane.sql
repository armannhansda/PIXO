DROP INDEX "bookmarks_user_id_idx";--> statement-breakpoint
DROP INDEX "likes_post_id_idx";--> statement-breakpoint
CREATE INDEX "idx_bookmarks_user_id" ON "bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_likes_post_id" ON "likes" USING btree ("post_id");