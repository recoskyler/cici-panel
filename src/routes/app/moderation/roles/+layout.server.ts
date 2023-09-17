
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { ENABLE_GRANULAR_PERMISSIONS } from '$lib/constants';

export const load: LayoutServerLoad = async () => {
  if (!ENABLE_GRANULAR_PERMISSIONS) throw error(501, 'feature-disabled');
};
