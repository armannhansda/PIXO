CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "notifications_user_read_idx" ON "notifications" USING btree ("user_id","read");--> statement-breakpoint
CREATE INDEX "posts_to_categories_category_id_idx" ON "posts_to_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "posts_to_tags_tag_id_idx" ON "posts_to_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");