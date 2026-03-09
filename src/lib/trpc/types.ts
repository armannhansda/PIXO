import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
import { type AppRouter } from '@/server/trpc/router';

/**
 * Inference helpers for input types
 * Example usage:
 * type CreatePostInput = RouterInputs['posts']['create']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * Example usage:
 * type PostsResponse = RouterOutputs['posts']['list']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// Common type exports
export type Post = RouterOutputs['posts']['getById'];
export type Category = RouterOutputs['categories']['getById'];
export type PostsList = RouterOutputs['posts']['list'];
export type CategoriesList = RouterOutputs['categories']['list'];